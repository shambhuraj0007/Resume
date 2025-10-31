'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Mail, User, Trash2, Coins, TrendingUp, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from "@/components/ui/toaster"
import { useCredits } from '@/hooks/useCredits'
import UpgradeModal from '@/components/credits/UpgradeModal'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Resume {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[500px]" />
      </div>
    </div>
  )
}

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  const { balance, refreshBalance } = useCredits();
  const settings = {
    displayName: window.localStorage.getItem("resumeitnow_name") || session?.user?.name,
    defaultTemplate: window.localStorage.getItem("resumeitnow_template") || 'modern'
  };

  const deleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      toast({
        title: "Success",
        description: "Resume deleted successfully!",
        duration: 3000,
      });
      
      setResumes((prevResumes) => prevResumes.filter((resume) => resume.id !== resumeId));
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error deleting resume. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const fetchResumes = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/resumes/user/${encodeURIComponent(session.user.email)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch resumes');
        }

        const data = await response.json();
        const resumeData = data.resumes.map((resume: any) => ({
          id: resume.resumeId,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        }));

        setResumes(resumeData);
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [session?.user?.email]);

  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (!session) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="container min-h-screen mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Profile Information Card */}
        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
                <AvatarFallback>
                  {session.user?.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{(settings.displayName !== '' ? settings.displayName : session.user?.name)}</CardTitle>
              <CardDescription>
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  <span>@{session.user?.name ?? 'username'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="w-4 h-4" />
                  <span>{session.user?.email}</span>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
          
          {/* Credit Balance Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5 text-primary" />
                Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{balance?.credits ?? 0}</span>
                  <span className="text-muted-foreground text-sm">
                    {balance?.credits === 1 ? 'credit' : 'credits'} remaining
                  </span>
                </div>
                
                {balance?.expiryDate && !balance?.hasExpired && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Expires {format(new Date(balance.expiryDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                
                {balance?.hasExpired && (
                  <p className="text-sm text-red-500 mt-2">
                    Your credits have expired
                  </p>
                )}
              </div>
              
              <Button 
                onClick={() => setShowUpgradeModal(true)} 
                className="w-full"
                variant="default"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy More Credits
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline"
                className="w-full"
              >
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resumes List Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Resumes</CardTitle>
            <CardDescription>Manage your created resumes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No resumes found. Create your first resume!</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/resume/create')}
                >
                  Create Resume
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {resumes
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((resume) => (
                    <Card
                      key={resume.id}
                      className="hover:bg-accent transition-colors cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="cursor-pointer" onClick={() => router.push(`/resume/${resume.id}`)}>
                            <CardTitle className="text-lg">{resume.id}</CardTitle>
                            <CardDescription>
                              Created: {new Date(resume.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-6 h-6 text-muted-foreground mr-2" />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="text-red-500 hover:text-red-700 transition-colors">
                                  <Trash2 />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your resume.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteResume(resume.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onSuccess={() => {
          refreshBalance();
          toast({
            title: "Credits Added!",
            description: "Your credits have been successfully added to your account.",
          });
        }}
      />
      
      <Toaster />
    </div>
  );
}