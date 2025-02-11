"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { deleteRadar } from "@/app/actions/radar";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quadrantNE: z.string().min(1, "North East quadrant name is required"),
  quadrantNW: z.string().min(1, "North West quadrant name is required"),
  quadrantSE: z.string().min(1, "South East quadrant name is required"),
  quadrantSW: z.string().min(1, "South West quadrant name is required"),
  ring1: z.string().min(1, "Ring 1 name is required"),
  ring2: z.string().min(1, "Ring 2 name is required"),
  ring3: z.string().min(1, "Ring 3 name is required"),
  ring4: z.string().optional()
});

export function RadarForm({ radar, onSubmit, userSlug }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: radar?.name ?? "",
      quadrantNE: radar?.quadrantNE ?? "",
      quadrantNW: radar?.quadrantNW ?? "",
      quadrantSE: radar?.quadrantSE ?? "",
      quadrantSW: radar?.quadrantSW ?? "",
      ring1: radar?.ring1 ?? "",
      ring2: radar?.ring2 ?? "",
      ring3: radar?.ring3 ?? "",
      ring4: radar?.ring4 ?? ""
    }
  });

  const [error, setError] = useState("");

  async function handleSubmit(data) {
    if (isPending) return;

    setError("");
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        // Convert empty ring values to null
        if (key.startsWith("ring") && value === "") {
          formData.append(key, ""); // This will be converted to null in the server action
        } else {
          formData.append(key, value);
        }
      });

      try {
        await onSubmit(formData);
      } catch (error) {
        console.error("Failed to submit radar:", error);
        setError(error.message || "Failed to submit radar");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoFocus data-1p-ignore placeholder="My Tech Radar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quadrantNW"
            render={({ field }) => (
              <FormItem>
                <FormLabel>North West Quadrant</FormLabel>
                <FormControl>
                  <Input placeholder="Techniques" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quadrantNE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>North East Quadrant</FormLabel>
                <FormControl>
                  <Input placeholder="Tools" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quadrantSW"
            render={({ field }) => (
              <FormItem>
                <FormLabel>South West Quadrant</FormLabel>
                <FormControl>
                  <Input placeholder="Platforms" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quadrantSE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>South East Quadrant</FormLabel>
                <FormControl>
                  <Input placeholder="Languages & Frameworks" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="ring1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ring 1</FormLabel>
                <FormControl>
                  <Input placeholder="Adopt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ring2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ring 2</FormLabel>
                <FormControl>
                  <Input placeholder="Trial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ring3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ring 3</FormLabel>
                <FormControl>
                  <Input placeholder="Assess" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ring4"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ring 4</FormLabel>
                <FormControl>
                  <Input placeholder="Hold" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : radar ? "Update Radar" : "Create Radar"}
          </Button>

          {radar && (
            <>
              <Button
                type="button"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Radar
              </Button>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Radar</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this radar? This action cannot be undone and will delete all
                      entries associated with this radar.
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
                            await deleteRadar(userSlug, radar.slug);
                            router.refresh();
                          } catch (error) {
                            console.error("Failed to delete radar:", error);
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
