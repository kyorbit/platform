import { Children, isValidElement } from 'react';
import { useFieldContext } from './hooks';
import { FormBase } from './form-base';
import type { FormControlProps } from './form-base';
import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FormSelectSharedProps = FormControlProps & {
  children: ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

function selectItems(
  children: ReactNode
): Array<{ value: string; label: ReactNode }> {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string; children?: ReactNode }>(child))
      return [];
    if (typeof child.props.value === 'string') {
      return [{ value: child.props.value, label: child.props.children }];
    }
    return selectItems(child.props.children);
  });
}

export function FormSelect({
  children,
  descPosition,
  placeholder,
  className,
  disabled,
  ...props
}: FormSelectSharedProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props} descPosition={descPosition}>
      <Select
        items={selectItems(children)}
        disabled={disabled}
        onValueChange={(e) => field.handleChange(e ?? '')}
        value={field.state.value}
      >
        <SelectTrigger
          aria-invalid={isInvalid}
          id={field.name}
          onBlur={field.handleBlur}
          className={className}
          disabled={disabled}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormBase>
  );
}

type FormNumberSelectProps = FormSelectSharedProps & {
  /** When set, maps to `undefined` field value (e.g. optional min/max). */
  emptyValue?: string;
  emptyLabel?: string;
};

export function FormNumberSelect({
  children,
  descPosition,
  placeholder,
  className,
  emptyValue,
  emptyLabel,
  ...props
}: FormNumberSelectProps) {
  const field = useFieldContext<number | undefined>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const raw = field.state.value;
  const selectValue =
    raw === undefined || raw === null ? (emptyValue ?? '') : String(raw);

  return (
    <FormBase {...props} descPosition={descPosition}>
      <Select
        items={[
          ...(emptyValue !== undefined && emptyLabel !== undefined
            ? [{ value: emptyValue, label: emptyLabel }]
            : []),
          ...selectItems(children),
        ]}
        onValueChange={(v) => {
          if (v === null) return;
          if (emptyValue !== undefined && v === emptyValue) {
            field.handleChange(undefined);
            return;
          }
          field.handleChange(Number(v));
        }}
        value={selectValue}
      >
        <SelectTrigger
          aria-invalid={isInvalid}
          id={field.name}
          onBlur={field.handleBlur}
          className={className}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {emptyValue !== undefined && emptyLabel !== undefined ? (
            <SelectItem value={emptyValue}>{emptyLabel}</SelectItem>
          ) : null}
          {children}
        </SelectContent>
      </Select>
    </FormBase>
  );
}
