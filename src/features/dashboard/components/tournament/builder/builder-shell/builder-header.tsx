import type { TournamentData } from '@/contracts/tournament/list';
import type { User } from '@/lib/auth';
import { TournamentStatusPill } from '@/features/dashboard/components/tournament/tournament-status-pill';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserDropdown } from '@/components/user/user-dropdown';
import { BrandIcon } from '@/components/ui/brand';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ButtonGroupSeparator } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import { GithubIcon } from '@/components/icons/github';

interface BuilderHeaderProps {
  tournament: TournamentData;
  tab: 'divisions' | 'brackets';
  onTabChange: (value: 'divisions' | 'brackets') => void;
  user: User | null | undefined;
}

export function BuilderHeader({
  tournament,
  tab,
  onTabChange,
  user,
}: BuilderHeaderProps) {
  return (
    <header className="bg-sidebar/70 supports-backdrop-filter:bg-sidebar/50 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <BrandIcon className="size-8" />
        <h1 className="text-lg font-semibold">{tournament.name}</h1>
        <TournamentStatusPill status={tournament.status} className="ml-1" />
      </div>

      <Tabs
        value={tab}
        onValueChange={(t) => onTabChange(t as typeof tab)}
        className="absolute top-2.5 left-1/2 h-10 -translate-x-1/2"
      >
        <TabsList className="bg-sidebar border-2 p-0">
          <TabsTrigger
            value="divisions"
            className="w-32 rounded-r-none border-none px-4 text-lg"
          >
            Divisions
          </TabsTrigger>
          <ButtonGroupSeparator />
          <TabsTrigger
            value="brackets"
            className="w-32 rounded-l-none border-none px-4 text-lg"
          >
            Brackets
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={
            <a
              href="https://github.com/chef0111/tku-sparring"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <GithubIcon />
        </Button>
        <ThemeToggle />
        {user && <UserDropdown user={user} className="-mr-2 scale-95" />}
      </div>
    </header>
  );
}
