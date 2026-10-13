import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { ChevronLeftIcon } from 'lucide-react';
import LoadingScreen from '@/components/navigation/loading';
import { BrandIcon } from '@/components/ui/brand';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  pendingComponent: () => <LoadingScreen title="Configuring your account..." />,
});

function AuthLayout() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: '/' });
    }
  }, [session, isPending, navigate]);

  if (isPending) return null;

  if (session) return null;

  return (
    <main className="bg-background text-foreground flex min-h-dvh w-full flex-col lg:flex-row">
      <div className="sticky flex min-h-[40vh] w-full flex-col justify-between overflow-hidden p-8 md:p-12 lg:min-h-dvh lg:w-1/2 lg:p-16">
        <div className="pointer-events-none absolute inset-0 lg:inset-8">
          <img
            src="https://assets.giabao.dev/auth.avif"
            alt="Abstract blue background"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full object-cover lg:rounded-2xl"
            loading="eager"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex size-fit items-center justify-center gap-1">
            <BrandIcon className="mr-auto size-8" />
            <span className="font-esbuild text-2xl font-bold">kyorbit</span>
          </div>

          <Button
            variant="ghost"
            className="gap-1.5 hover:bg-blue-500/20! has-data-[icon=inline-start]:ps-1.5"
            nativeButton={false}
            render={<Link to="/" />}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Back to Website
          </Button>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0">
          <h1 className="text-foreground mb-4 max-w-xl text-4xl leading-[1.1] font-medium tracking-tight sm:text-5xl lg:text-6xl">
            Where Innovation
            <br />
            Meets Impact.
          </h1>
          <blockquote className="text-foreground/90 max-w-lg text-base leading-relaxed text-pretty sm:text-lg">
            Kyorbit is a Taekwondo tournament-management platform, designed to
            support training sessions and competitions.
          </blockquote>
        </div>
      </div>

      <div className="bg-background isolate flex min-h-0 w-full flex-1 flex-col items-center justify-center self-stretch overflow-hidden p-6 contain-strict sm:p-8 lg:min-h-screen">
        <div aria-hidden className="absolute top-0 right-0 -z-10 opacity-60">
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.04)_50%,--theme(--color-foreground/.015)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full blur-md" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
        </div>

        <div className="relative w-full max-w-md md:max-w-lg xl:max-w-xl">
          <div className="mx-auto space-y-4">
            <Outlet />
            <p className="text-muted-foreground mt-4 text-center text-sm">
              Source code available on{' '}
              <a
                className="hover:text-primary underline underline-offset-4"
                href="https://github.com/kyorbit"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
