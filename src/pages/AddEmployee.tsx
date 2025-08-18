import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Briefcase, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "admin", label: "Admin", description: "Full system access", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { id: "manager", label: "Manager", description: "Team management", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { id: "employee", label: "Employee", description: "Standard access", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" }, 
  { id: "support", label: "Support", description: "Customer support", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { id: "analyst", label: "Analyst", description: "Data analysis", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" }
];

export default function AddEmployee() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCurrentStep(3);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Employee Added Successfully",
      description: `${formData.firstName} ${formData.lastName} has been added to the team.`,
    });
    
    setIsSubmitting(false);
    navigate("/", { state: { section: "users" } });
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email;
  const isStep2Valid = formData.role;

  const selectedRole = roles.find(role => role.id === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-background/95 via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="hover:bg-muted/50 transition-all duration-300 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Add New Employee</h1>
                <p className="text-muted-foreground">Create a new team member account with proper permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-6 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            {[
              { step: 1, title: "Personal Info", icon: User },
              { step: 2, title: "Role & Permissions", icon: Briefcase },
              { step: 3, title: "Complete", icon: CheckCircle }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`
                  h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 mb-3
                  ${currentStep >= step 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  currentStep >= step ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <Card className="animate-fade-in shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                      className="h-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/10 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      required
                      className="h-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/10 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="pl-12 h-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/10 border-border/50"
                      required
                    />
                  </div>
                </div>
                <div className="pt-6">
                  <Button 
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/25"
                  >
                    Continue to Role Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="animate-fade-in shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Select Role *</Label>
                  <div className="grid gap-3">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        onClick={() => handleInputChange("role", role.id)}
                        className={`
                          p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                          ${formData.role === role.id 
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                            : 'border-border/50 hover:border-primary/30'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{role.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                          </div>
                          <Badge variant="outline" className={`${role.color} border-0 font-medium`}>
                            {role.label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12 transition-all duration-300"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!isStep2Valid}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/25"
                  >
                    Create Employee
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="animate-fade-in shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <div className="animate-bounce mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Creating Employee Account</h3>
                <p className="text-muted-foreground mb-6">
                  Setting up {formData.firstName} {formData.lastName} with {selectedRole?.label} permissions...
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}