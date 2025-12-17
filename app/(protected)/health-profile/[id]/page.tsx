'use client'


import Loader from '@/components/common/Loader';
import EditMemberDialog from '@/components/health-profile/edit-form-member';
import { healthProfileSchema, memberSchema } from '@/schema/health-profile/health-profile.schema';
import { useGetHealthProfile } from '@/services/health-profile/health-profile.query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

export default function HealthProfile() {

    const [editingMember, setEditingMember] = useState<any>(null);

    const params = useParams();
    const memberId = params?.id as string;



    const { data: memberHealth, isLoading: isHealthProfileFetching } = useGetHealthProfile(memberId!);


    const editingMemberHealth = memberHealth?.data

    console.log(editingMemberHealth, "editingMemberHealtheditingMemberHealth")

    const editMemberForm = useForm<any>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            isAdmin: false,
        },
    });

    const healthProfileForm = useForm<any>({
        resolver: zodResolver(healthProfileSchema),
        defaultValues: {
            conditions: [],
            allergies: [],
            dietaryRestrictions: [],
            goals: [],
            preferredCuisines: [],
            organicPreference: 'standard_only',
            hasDeepFreezer: false,
            shopsDaily: false,
            privacyLevel: 'private',
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
        if (!editingMemberHealth) return;

        healthProfileForm.reset({
            height: editingMemberHealth.height ?? undefined,
            weight: editingMemberHealth.weight ?? undefined,
            activityLevel: editingMemberHealth.activityLevel ?? undefined,
            conditions: editingMemberHealth.conditions ?? [],
            allergies: editingMemberHealth.allergies ?? [],
            dietaryRestrictions: editingMemberHealth.dietaryRestrictions ?? [],
            organicPreference:
                editingMemberHealth.organicPreference ?? 'standard_only',
            goals: editingMemberHealth.goals ?? [],
            targetWeight: editingMemberHealth.targetWeight ?? undefined,
            cookingSkill: editingMemberHealth.cookingSkill ?? undefined,
            cookingFrequency: editingMemberHealth.cookingFrequency ?? undefined,
            preferredCuisines: editingMemberHealth.preferredCuisines ?? [],
            budgetFlexibility: editingMemberHealth.budgetFlexibility ?? undefined,
            hasDeepFreezer: editingMemberHealth.hasDeepFreezer ?? false,
            shopsDaily: editingMemberHealth.shopsDaily ?? false,
            privacyLevel: editingMemberHealth.privacyLevel ?? 'private',
            excludedFoods: editingMemberHealth.excludedFoods ?? [],
            includedFoods: editingMemberHealth.includedFoods ?? [],
            customExclusions: editingMemberHealth.customExclusions ?? [],
            customInclusions: editingMemberHealth.customInclusions ?? [],
            preferenceSets: editingMemberHealth.preferenceSets ?? [],
            autoLearn: editingMemberHealth.autoLearn ?? true,
            autoSwap: editingMemberHealth.autoSwap ?? true,
        });
    }, [editingMemberHealth, healthProfileForm]);

    const onHealthProfileSubmit = (data: any) => {

        const processedData = {
            ...data,
            height: data.height ? Number(data.height) : undefined,
            weight: data.weight ? Number(data.weight) : undefined,
            targetWeight: data.targetWeight ? Number(data.targetWeight) : undefined,
        };

        // if (editingMember) {
        //     updateHealthProfileMutation.mutate({
        //         memberId: editingMember.id,
        //         healthData: processedData
        //     });
        // }
    };

    if (isHealthProfileFetching) {
        return <Loader />
    }



    return (
        <div>

            <EditMemberDialog
                healthProfileForm={healthProfileForm}
                open={!!memberId}
                onClose={() => setEditingMember(null)}
                onSubmit={onHealthProfileSubmit}
                form={editMemberForm}
                member={editingMember}
                isSaving={false}
            />

        </div>
    )
}
