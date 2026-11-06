"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import type * as React from "react";
import { useRef } from "react";
import {
  type ArrayPath,
  type Control,
  Controller,
  type FieldValues,
  get,
  type Path,
  useFieldArray,
  useFormState,
} from "react-hook-form";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

/** Keeps a dragged row in its column. */
const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

/** One row of the list. useFieldArray needs objects, so each string lives under `value`. */
export type SortableListItem = { value: string };

export interface FormSortableListProps<T extends FieldValues> {
  control: Control<T, any, any>;
  /** Field-array path whose value is `{ value: string }[]`. */
  name: ArrayPath<T>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  addLabel?: string;
  emptyLabel?: string;
  /** Hides the add button once the list is this long. */
  maxItems?: number;
  /** Singular noun used in accessible labels, e.g. "feature". */
  itemLabel?: string;
}

/**
 * Editable list field: add rows, edit them in place, drag (or keyboard-move) to reorder,
 * remove them. Enter adds a row below; Backspace on an empty row removes it;
 * Alt+↑/↓ moves the current row. The drag handle also works with Space + arrow keys.
 */
export function FormSortableList<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  addLabel = "Add item",
  emptyLabel = "Nothing added yet.",
  maxItems,
  itemLabel = "item",
}: FormSortableListProps<T>) {
  const { fields, append, insert, remove, move } = useFieldArray({
    control,
    name,
  });
  const { errors } = useFormState({ control, name: name as Path<T> });
  const listError = get(errors, name);
  const listMessage: string | undefined =
    listError?.root?.message ?? listError?.message;

  const inputs = useRef(new Map<string, HTMLInputElement>());
  /** After removing `index`, focus the row that takes its place visually (previous, else next). */
  const focusNeighbourOf = (index: number) => {
    const id = fields[index > 0 ? index - 1 : index + 1]?.id;
    if (id) requestAnimationFrame(() => inputs.current.get(id)?.focus());
  };

  const canAdd = maxItems === undefined || fields.length < maxItems;
  const newItem = { value: "" } as never;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = fields.findIndex((f) => f.id === active.id);
    const to = fields.findIndex((f) => f.id === over.id);
    if (from !== -1 && to !== -1) move(from, to);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (e.key === "Enter") {
      // Never submit the surrounding form from a list row.
      e.preventDefault();
      if (canAdd) insert(index + 1, newItem, { shouldFocus: true });
    } else if (
      e.key === "Backspace" &&
      e.currentTarget.value === "" &&
      fields.length > 0
    ) {
      e.preventDefault();
      remove(index);
      focusNeighbourOf(index);
    } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      const to = e.key === "ArrowUp" ? index - 1 : index + 1;
      if (to < 0 || to >= fields.length) return;
      move(index, to);
      const id = fields[index].id;
      requestAnimationFrame(() => inputs.current.get(id)?.focus());
    }
  }

  return (
    <Field data-invalid={!!listMessage}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <FieldLabel>{label}</FieldLabel>
          {maxItems !== undefined && fields.length > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {fields.length} / {maxItems}
            </span>
          )}
        </div>
      )}

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-1.5">
              {fields.map((item, index) => (
                <Controller
                  key={item.id}
                  control={control}
                  name={`${name}.${index}.value` as Path<T>}
                  render={({ field, fieldState }) => (
                    <SortableRow
                      id={item.id}
                      index={index}
                      itemLabel={itemLabel}
                      error={fieldState.error?.message}
                      onRemove={() => {
                        remove(index);
                        focusNeighbourOf(index);
                      }}
                    >
                      <input
                        {...field}
                        value={field.value ?? ""}
                        ref={(node) => {
                          field.ref(node);
                          if (node) inputs.current.set(item.id, node);
                          else inputs.current.delete(item.id);
                        }}
                        placeholder={placeholder}
                        aria-label={`${capitalize(itemLabel)} ${index + 1}`}
                        aria-invalid={fieldState.invalid}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                      />
                    </SortableRow>
                  )}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append(newItem, { shouldFocus: true })}
        >
          <Plus />
          {addLabel}
        </Button>
      )}

      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError>{listMessage}</FieldError>
    </Field>
  );
}

function SortableRow({
  id,
  index,
  itemLabel,
  error,
  onRemove,
  children,
}: {
  id: string;
  index: number;
  itemLabel: string;
  error?: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative flex flex-col gap-1", isDragging && "z-10")}
    >
      {/* The row is the field: one border, one focus ring; the input inside is bare. */}
      <div
        className={cn(
          "flex h-10 items-center rounded-md border border-border bg-background pr-1 transition-[color,box-shadow,border-color] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30",
          error && "border-red-600 focus-within:border-red-600",
          isDragging && "shadow-lg",
        )}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${itemLabel} ${index + 1}`}
          className={cn(
            "flex h-full w-8 shrink-0 touch-none items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <GripVertical className="size-4" />
        </button>
        {children}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${itemLabel} ${index + 1}`}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:bg-muted/30 hover:text-destructive focus-visible:text-destructive"
        >
          <X className="size-4" />
        </button>
      </div>
      <FieldError>{error}</FieldError>
    </li>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
