import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Resume from '@/models/Resume';

// GET all resumes for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.email !== params.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const resumes = await Resume.find({ userEmail: params.email })
      .sort({ createdAt: -1 })
      .select('resumeId personalDetails jobTitle createdAt updatedAt template');

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

// POST create a new resume
export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.email !== params.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const resumeId = `resume_${Date.now()}`;
    
    const resume = await Resume.create({
      ...body,
      userId: session.user.id || params.email,
      userEmail: params.email,
      resumeId,
    });

    // Increment resume counter
    const ResumeCounter = (await import('@/models/ResumeCounter')).default;
    await ResumeCounter.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ resumeId: resume.resumeId }, { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}
