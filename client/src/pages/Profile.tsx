import { useContext, useState } from "react";
import { UserContext } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    description: user?.description || "",
    avatar: user?.avatar || "",
  });

  // Get user's services
  const { data: services } = useQuery({
    queryKey: ['/api/organizations', user?.id, 'services'],
    enabled: !!user,
  });

  // Get user's equipment
  const { data: equipment } = useQuery({
    queryKey: ['/api/organizations', user?.id, 'equipment'],
    enabled: !!user,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real implementation, we would update the profile in the backend
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-600 mt-1">Manage your organization's information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <AvatarWithFallback 
                  src={user?.avatar} 
                  name={user?.name} 
                  className="h-24 w-24 mb-4" 
                />
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-500">@{user?.username}</p>
                <div className="mt-4 text-center">
                  <p className="text-gray-600">{user?.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-6 w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Stats */}
        <div className="col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input 
                      id="avatar" 
                      name="avatar" 
                      value={formData.avatar} 
                      onChange={handleChange} 
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Organization Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="services">
                  <TabsList className="mb-4">
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="services">
                    {!services || services.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">You haven't created any services yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service: any) => (
                          <div key={service.id} className="border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{service.title}</h3>
                                <p className="text-sm text-gray-600">{service.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {service.isFree ? "Free" : "Paid"} • {service.serviceType} • {service.availability}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="equipment">
                    {!equipment || equipment.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">You haven't listed any equipment yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {equipment.map((item: any) => (
                          <div key={item.id} className="border-b border-gray-200 pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Status: {item.isAvailable ? "Available" : "Reserved"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
