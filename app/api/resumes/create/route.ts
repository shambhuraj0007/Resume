import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resume from '@/models/Resume';
import ResumeCounter from '@/models/ResumeCounter';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, userEmail, resumeData } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Generate unique resume ID
    const resumeId = `resume_${new Date().getTime()}`;

    // Create resume document
    const resume = await Resume.create({
      userId,
      userEmail,
      resumeId,
      ...resumeData,
    });

    // Update resume counter
    await ResumeCounter.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      resumeId: resume.resumeId,
      message: 'Resume created successfully',
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}
