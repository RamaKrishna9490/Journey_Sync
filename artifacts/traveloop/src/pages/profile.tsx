import { useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  language: z.string(),
});

type FormData = z.infer<typeof schema>;

export function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { data: profile, isLoading } = useGetMe();
  const updateMe = useUpdateMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", language: "en" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, language: profile.language });
    }
  }, [profile]);

  const onSubmit = async (values: FormData) => {
    try {
      await updateMe.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-4xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border">
          <CardContent className="pt-6 pb-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden border-2 border-border shadow-sm flex-shrink-0">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <User size={32} />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">{clerkUser?.fullName || "Traveler"}</p>
              <p className="text-muted-foreground text-sm">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-xs text-muted-foreground mt-1">Profile photo managed via your Clerk account</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile form */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Personal information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display name</FormLabel>
                      <FormControl>
                        <Input className="h-12" {...field} data-testid="input-profile-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="language" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Input className="h-12" placeholder="en" {...field} data-testid="input-language" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="font-semibold h-12 px-8" disabled={updateMe.isPending} data-testid="button-save-profile">
                    {updateMe.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
