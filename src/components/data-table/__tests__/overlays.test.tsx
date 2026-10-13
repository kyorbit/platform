// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

beforeAll(() => {
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      readonly pointerType = 'mouse';
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.scrollIntoView = () => {};
});

afterEach(cleanup);

function activate(element: HTMLElement) {
  fireEvent.pointerDown(element, { button: 0, ctrlKey: false });
  fireEvent.mouseDown(element, { button: 0 });
  fireEvent.pointerUp(element, { button: 0 });
  fireEvent.mouseUp(element, { button: 0 });
  fireEvent.click(element);
}

function NestedChoices() {
  return (
    <>
      <Select
        items={[
          { value: 'North', label: 'North' },
          { value: 'South', label: 'South' },
        ]}
        defaultValue="North"
      >
        <SelectTrigger aria-label="Choose team">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="North">North</SelectItem>
            <SelectItem value="South">South</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger>More filters</PopoverTrigger>
        <PopoverContent>
          <input aria-label="Filter text" />
        </PopoverContent>
      </Popover>
    </>
  );
}

describe('nested overlays', () => {
  it('keeps checkbox actions open, blocks disabled actions, and restores menu focus', async () => {
    const onCheckedChange = vi.fn();
    const disabledAction = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>
          Table actions
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked onCheckedChange={onCheckedChange}>
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem disabled onClick={disabledAction}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const trigger = screen.getByRole('button', { name: 'Table actions' });
    activate(trigger);
    const checkbox = await screen.findByRole('menuitemcheckbox', {
      name: 'Name',
    });
    activate(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(false, expect.anything());
    expect(screen.getByRole('menu')).toBeTruthy();
    activate(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(disabledAction).not.toHaveBeenCalled();
    fireEvent.keyDown(checkbox, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('runs a nested radio action once and keeps the menu available for more choices', async () => {
    const onValueChange = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Row actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Gender</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Choose gender</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="M" onValueChange={onValueChange}>
                  <DropdownMenuRadioItem value="M">Male</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="F">
                    Female
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    activate(screen.getByRole('button', { name: 'Row actions' }));
    const submenuTrigger = await screen.findByRole('menuitem', {
      name: 'Gender',
    });
    submenuTrigger.focus();
    fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });
    activate(await screen.findByRole('menuitemradio', { name: 'Female' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('F', expect.anything());
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    fireEvent.keyDown(screen.getByRole('menuitemradio', { name: 'Female' }), {
      key: 'Escape',
    });
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
  });

  it('keeps a dialog open while selecting a nested value and restores focus when dismissed', async () => {
    render(
      <Dialog>
        <DialogTrigger>Edit athlete</DialogTrigger>
        <DialogContent>
          <DialogTitle>Athlete settings</DialogTitle>
          <DialogDescription>Choose the athlete team.</DialogDescription>
          <NestedChoices />
        </DialogContent>
      </Dialog>
    );
    const trigger = screen.getByRole('button', { name: 'Edit athlete' });
    trigger.focus();
    activate(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Athlete settings',
    });
    activate(within(dialog).getByRole('combobox', { name: 'Choose team' }));
    activate(await screen.findByRole('option', { name: 'South' }));
    expect(
      screen.getByRole('dialog', { name: 'Athlete settings' })
    ).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.getByRole('combobox', { name: 'Choose team' }).textContent
      ).toContain('South')
    );
    activate(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('keeps a sheet open while a nested popover receives input', async () => {
    render(
      <Sheet>
        <SheetTrigger>Division settings</SheetTrigger>
        <SheetContent>
          <SheetTitle>Configure division</SheetTitle>
          <SheetDescription>Adjust eligible athlete filters.</SheetDescription>
          <NestedChoices />
        </SheetContent>
      </Sheet>
    );
    activate(screen.getByRole('button', { name: 'Division settings' }));
    await screen.findByRole('dialog', { name: 'Configure division' });
    activate(screen.getByRole('button', { name: 'More filters' }));
    const input = await screen.findByLabelText('Filter text');
    fireEvent.change(input, { target: { value: 'Black belt' } });
    expect(
      screen.getByRole('dialog', { name: 'Configure division' })
    ).toBeTruthy();
    expect(screen.getByDisplayValue('Black belt')).toBe(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByLabelText('Filter text')).toBeNull()
    );
    expect(
      screen.getByRole('dialog', { name: 'Configure division' })
    ).toBeTruthy();
  });
});
