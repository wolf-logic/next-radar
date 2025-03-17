"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEntry, updateEntry, deleteEntry } from "@/app/actions/entry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const statusOptions = [
  { value: "New", label: "New" },
  { value: "Moved In", label: "Moved In" },
  { value: "Moved Out", label: "Moved Out" },
  { value: "No Change", label: "No Change" }
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ring: z.string().min(1, "Ring is required"),
  quadrant: z.string().min(1, "Quadrant is required"),
  status: z.string().min(1, "Status is required"),
  description: z.string().optional()
});

export function RadarEntryForm({ entry, radarId, ringOptions, quadrantOptions, isOwner }) {
  const router = useRouter();
  const isEditing = !!entry;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing
      ? {
          name: entry.name,
          ring: entry.ring.toString(),
          quadrant: entry.quadrant,
          status: entry.status,
          description: entry.description || ""
        }
      : {
          name: "",
          ring: "",
          quadrant: "",
          status: "New",
          description: ""
        }
  });

  async function onSubmit(data) {
    const result = isEditing
      ? await updateEntry(entry.id, {
          ...data,
          ring: parseInt(data.ring),
          quadrant: data.quadrant
        })
      : await createEntry(radarId, {
          ...data,
          ring: parseInt(data.ring),
          quadrant: data.quadrant
        });

    if (result.success) {
      form.reset(data); // Reset form state to mark it as pristine
      router.refresh();
      router.push(`..`); // Go back to radar view
    }
  }

  // Filter out any quadrants that don't have names
  const normalizedQuadrantOptions = quadrantOptions
    ?.filter(option => option.label && option.label.trim() !== "")
    ?.map(option => ({
      ...option,
      value: option.value
    }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoFocus placeholder="Item of interest" data-1p-ignore {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ring"
          render={({ field }) => {
            const selectedOption = ringOptions?.find(option => option.value.toString() === field.value);
            return (
              <FormItem>
                <FormLabel>Ring</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a ring">{selectedOption?.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ringOptions?.map(option => {
                        if (!option.label) return null;
                        return (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="quadrant"
          render={({ field }) => {
            const selectedOption = normalizedQuadrantOptions?.find(option => option.value === field.value);
            return (
              <FormItem>
                <FormLabel>Quadrant</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quadrant">{selectedOption?.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {normalizedQuadrantOptions?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => {
            const selectedOption = statusOptions.find(option => option.value === field.value);
            return (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status">{selectedOption?.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="About this item of interest..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={(isEditing && !form.formState.isDirty) || form.formState.isSubmitting}>
            {isEditing ? "Save Changes" : "Create Entry"}
          </Button>

          {isEditing && isOwner && (
            <>
              <Button
                type="button"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Entry
              </Button>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Entry</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this entry? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            const result = await deleteEntry(entry.id);
                            if (result.success) {
                              router.refresh();
                              router.push(`..`);
                            }
                          } catch (error) {
                            console.error("Failed to delete entry:", error);
                            setShowDeleteDialog(false);
                          }
                        });
                      }}
                      disabled={isPending}
                    >
                      {isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
