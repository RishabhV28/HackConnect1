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
import { Switch } from "@/components/ui/switch";

// Extended schema with validation rules
const addEquipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

type AddEquipmentFormProps = {
  onSuccess?: () => void;
};

export default function AddEquipmentForm({ onSuccess }: AddEquipmentFormProps) {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof addEquipmentSchema>>({
    resolver: zodResolver(addEquipmentSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      isAvailable: true,
    },
  });

  const addEquipmentMutation = useMutation({
    mutationFn: (values: z.infer<typeof addEquipmentSchema>) => 
      apiRequest('POST', '/api/equipment', {
        ...values,
        organizationId: user?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', user?.id, 'equipment'] });
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      
      toast({
        title: "Equipment added",
        description: "Your equipment has been listed successfully.",
      });
      
      // Reset form
      form.reset();
      
      // Call success callback
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof addEquipmentSchema>) {
    addEquipmentMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. DSLR Camera" {...field} />
              </FormControl>
              <FormDescription>
                The name of the equipment you're sharing
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
                  placeholder="Describe the equipment, including model, specs, etc..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Detailed description of the equipment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg (optional)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide a URL to an image of your equipment
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Available for Borrowing</FormLabel>
                <FormDescription>
                  Toggle if this equipment is currently available
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
            disabled={addEquipmentMutation.isPending}
          >
            {addEquipmentMutation.isPending ? "Adding..." : "Add Equipment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
