import { LogInIcon, MenuIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { ComponentProps } from 'react';
import { UserDropdown } from '@/components/user/user-dropdown';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useSettings } from '@/features/app/contexts/settings';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AppSettings } from '@/features/app/components/settings';
import { assetUrl } from '@/config/assets';

export const Navbar = () => {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  const { isOpen, setIsOpen } = useSettings();

  return (
    <nav className="bg-backround flex h-20 w-full items-center justify-between">
      <div className="flex w-[13vw] shrink-0 items-center justify-center gap-4">
        <img
          src={assetUrl('uit.webp')}
          loading="eager"
          alt="UIT Logo"
          className="h-12 select-none"
        />
        <img
          src={assetUrl('tku.webp')}
          loading="eager"
          alt="TKU Logo"
          className="h-14 select-none"
        />
      </div>
      <div className="flex w-full grow items-center justify-center">
        <h1 className="text-4xl font-bold select-none!">TKU Sparring System</h1>
      </div>
      <div className="flex w-[13vw] shrink-0 items-center justify-end gap-1 px-2.5">
        {isPending ? null : <SessionActions user={user} />}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                className="no-focus mx-2.5 size-12! hover:bg-transparent"
              >
                <MenuIcon className="size-12" />
              </Button>
            }
          />
          <AppSettings />
        </Dialog>
      </div>
    </nav>
  );
};

function LoginLink() {
  return (
    <Link to="/login">
      <Button variant="outline" size="lg" className="mx-1 text-lg">
        <LogInIcon data-icon="inline-start" /> Login
      </Button>
    </Link>
  );
}

function SessionActions({
  user,
}: {
  user: ComponentProps<typeof UserDropdown>['user'] | undefined;
}) {
  return user ? <UserDropdown user={user} /> : <LoginLink />;
}
