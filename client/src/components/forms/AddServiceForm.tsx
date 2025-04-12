import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useContext } from "react";
import { UserContext } from "@/App";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Extended schema with validation rules
const addServiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isFree: z.boolean(),
  serviceType: z.string().min(1, "Service type is required"),
  availability: z.string().min(1, "Availability is required"),
});

type AddServiceFormProps = {
  onSuccess?: () => void;
};

export default function AddServiceForm({ onSuccess }: AddServiceFormProps) {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof addServiceSchema>>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      isFree: true,
      serviceType: "Technical",
      availability: "Available on request",
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: (values: z.infer<typeof addServiceSchema>) => 
      apiRequest('POST', '/api/services', {
        ...values,
        organizationId: user?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', user?.id, 'services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: "Service added",
        description: "Your service has been added successfully.",
      });
      
      // Reset form
      form.reset();
      
      // Call success callback
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof addServiceSchema>) {
    addServiceMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Web Development Workshop" {...field} />
              </FormControl>
              <FormDescription>
                The name of the service you're offering
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what your service includes..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Detailed description of what you're offering
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Category of service you're providing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Available on request">Available on request</SelectItem>
                  <SelectItem value="Available on weekends">Available on weekends</SelectItem>
                  <SelectItem value="Available weekdays">Available weekdays</SelectItem>
                  <SelectItem value="Monthly sessions">Monthly sessions</SelectItem>
                  <SelectItem value="Limited availability">Limited availability</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                When your service is available
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFree"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Free Service</FormLabel>
                <FormDescription>
                  Toggle if this service is free or paid
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              if (onSuccess) onSuccess();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={addServiceMutation.isPending}
          >
            {addServiceMutation.isPending ? "Adding..." : "Add Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
