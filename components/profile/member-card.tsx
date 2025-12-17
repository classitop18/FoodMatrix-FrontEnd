import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface MemberCardProps {
  member: any;
}

type MemberData = z.infer<typeof memberSchema>;
type HealthProfileData = z.infer<typeof healthProfileSchema>;

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  console.log(member, "membermember");

  // Application States
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set(),
  );
  const [editingMember, setEditingMember] = useState<any>(null);
  const updateMemberMutation = useUpdateMember();
  const deleteMemberMutation = useDeleteMember();
  const updateHealthProfileMutation = useUpdateHealthProfile();

  const editMemberForm = useForm<MemberData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      isAdmin: false,
    },
  });

  const isExpanded = expandedMembers.has(member.id);

  // Fetch health profile for editing member
  const { data: editingMemberHealth } = useQuery({
    queryKey: ["/api/members", editingMember?.id, "health"],
    queryFn: async () => {
      if (!editingMember) return null;
      const response = await apiRequest(
        "GET",
        `/api/members/${editingMember.id}/health`,
      );
      return response.json();
    },
    enabled: !!editingMember,
  });

  console.log({ editingMember });

  const healthProfileForm = useForm<HealthProfileData>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      conditions: [],
      allergies: [],
      dietaryRestrictions: [],
      goals: [],
      preferredCuisines: [],
      organicPreference: "standard_only",
      hasDeepFreezer: false,
      shopsDaily: false,
      privacyLevel: "private",
      excludedFoods: [],
      includedFoods: [],
      customExclusions: [],
      customInclusions: [],
      preferenceSets: [],
      autoLearn: true,
      autoSwap: true,
    },
  });

  // Update forms when editing member changes
  React.useEffect(() => {
    if (editingMember) {
      editMemberForm.reset({
        name: editingMember.name,
        age: editingMember.age,
        sex: editingMember.sex,
        isAdmin: editingMember.isAdmin,
      });

      // Reset health profile form with current data
      if (editingMemberHealth) {
        healthProfileForm.reset({
          ...editingMemberHealth,
          height: editingMemberHealth.height || undefined,
          weight: editingMemberHealth.weight || undefined,
          activityLevel: editingMemberHealth.activityLevel || undefined,
          conditions: editingMemberHealth.conditions || [],
          allergies: editingMemberHealth.allergies || [],
          dietaryRestrictions: editingMemberHealth.dietaryRestrictions || [],
          organicPreference:
            editingMemberHealth.organicPreference || "standard_only",
          goals: editingMemberHealth.goals || [],
          targetWeight: editingMemberHealth.targetWeight || undefined,
          cookingSkill: editingMemberHealth.cookingSkill || undefined,
          cookingFrequency: editingMemberHealth.cookingFrequency || undefined,
          preferredCuisines: editingMemberHealth.preferredCuisines || [],
          budgetFlexibility: editingMemberHealth.budgetFlexibility || undefined,
          hasDeepFreezer: editingMemberHealth.hasDeepFreezer || false,
          shopsDaily: editingMemberHealth.shopsDaily || false,
          privacyLevel: editingMemberHealth.privacyLevel || "private",
          excludedFoods: editingMemberHealth.excludedFoods || [],
        });
      }
    }
  }, [editingMemberHealth]);

  console.log({ editingMemberHealth }, "editingMemberHealth");

  function toggleExpand(id: any): void {
    const memberId = String(id);
    setExpandedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  }

  function onEditMember(member: any): void {
    const memberId = String(member.id);

    // Ensure the member card is expanded so user can see current profile before editing
    setExpandedMembers((prev) => {
      const newSet = new Set(prev);
      newSet.add(memberId);
      return newSet;
    });

    // Offer navigation to a dedicated edit page if app provides one.
    // If user confirms, navigate to /members/:id/edit — adjust route as needed in your app.
    if (typeof window !== "undefined") {
      const proceed = window.confirm(
        "Open member edit page to modify the health profile?",
      );
      if (proceed) {
        window.location.href = `/members/${memberId}/edit`;
        return;
      }
    }
    // Fallback: inform the user the profile panel was expanded.
    toast({
      title: "Edit Member",
      description:
        "Member details expanded. Use the edit page to modify the health profile.",
    });
  }

  const onHealthProfileSubmit = (data: HealthProfileData) => {
    const processedData = {
      ...data,
      height: data.height ? Number(data.height) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      targetWeight: data.targetWeight ? Number(data.targetWeight) : undefined,
    };

    if (editingMember) {
      updateHealthProfileMutation.mutate({
        memberId: editingMember.id,
        healthData: processedData,
      });
    }
  };

  const memberDeleteHandler = (id: string) => {
    try {
    } catch (error) {}
  };

  return (
    <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 shadow-md transition-all">
      <div className="flex items-start gap-4 flex-1">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {member.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold">{member.name}</h3>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={member.isAdmin ? "bg-green-600" : "bg-gray-600"}>
              {member.isAdmin ? "Admin" : "Member"}
            </Badge>
            <Badge variant="outline">
              {member.age} years • {member.sex}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Member since:{" "}
            {new Date(member.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingMember(member)}
            className="text-green-600 hover:text-green-700"
          >
            View Health Profile
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {member.name}? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => memberDeleteHandler(member.id)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Member
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <EditMemberDialog
        healthProfileForm={healthProfileForm}
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={onHealthProfileSubmit}
        form={editMemberForm}
        member={editingMember}
        isSaving={updateMemberMutation.isPending}
      />
    </div>
  );
};
