import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FoodPreferencesForm } from "./food-preference-form";


interface EditMemberDialogProps {
    open: boolean;
    isSaving: boolean;
    member: any;                  // you can strongly type this if needed
    form: any;                    // react-hook-form instance typed in parent
    onClose: () => void;
    onSubmit: any;
    healthProfileForm: any;
}

export default function EditMemberDialog({
    open,
    onClose,
    isSaving,
    member,
    form,
    onSubmit,
    healthProfileForm
}: EditMemberDialogProps) {

    console.log(healthProfileForm,"healthProfileFormhealthProfileForm")


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">

                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl font-semibold">Edit Member Profile</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Update the member’s basic details and complete health profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6">
                    <Tabs defaultValue="basic" className="w-full mt-4">
                        <TabsList className="w-full grid grid-cols-2 bg-muted/40 p-1 rounded-lg">
                            <TabsTrigger
                                value="basic"
                                className="text-sm font-medium data-[state=active]:bg-green-600 data-[state=active]:text-white hover:bg-orange-500 hover:text-white"
                            >
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="health"
                                className="text-sm font-medium data-[state=active]:bg-green-600 data-[state=active]:text-white hover:bg-orange-500 hover:text-white"
                            >
                                Health Profile
                            </TabsTrigger>
                        </TabsList>

                        <div className="max-h-[65vh] overflow-y-auto pr-3">
                            <TabsContent value="basic" className="space-y-4 pt-4">
                                <Form {...form}>
                                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="age"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Age</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="34" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="sex"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Sex</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="male">Male</SelectItem>
                                                                <SelectItem value="female">Female</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="isAdmin"
                                            render={({ field }) => (
                                                <FormItem className="flex justify-between items-center border rounded-lg p-3">
                                                    <div>
                                                        <FormLabel>Admin Access</FormLabel>
                                                        <p className="text-xs text-muted-foreground">
                                                            Can manage account settings & members
                                                        </p>
                                                    </div>
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="health" className="space-y-6 pt-4">
                                <Form {...healthProfileForm}>
                                    <form className="space-y-4" onSubmit={healthProfileForm.handleSubmit(onSubmit)}>

                                        {/* Physical Stats */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Physical Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={healthProfileForm?.control}
                                                    name="height"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Height (inches)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g., 68"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={healthProfileForm.control}
                                                    name="weight"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Weight (pounds)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="e.g., 150"
                                                                    {...field}
                                                                    value={field.value || ''}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={healthProfileForm.control}
                                                name="activityLevel"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Activity Level</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select activity level" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                                                                <SelectItem value="moderate">Moderate (1-3 days/week)</SelectItem>
                                                                <SelectItem value="active">Active (3-5 days/week)</SelectItem>
                                                                <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Health Conditions */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Health Conditions</h4>
                                            <FormField
                                                control={healthProfileForm.control}
                                                name="conditions"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {(['type1_diabetes', 'type2_diabetes', 'prediabetes', 'hypertension', 'high_cholesterol', 'heart_disease', 'ibs', 'gerd', 'celiac_disease', 'obesity', 'pcos', 'kidney_disease', 'gout'] as const).map((condition) => (
                                                                <FormField
                                                                    key={condition}
                                                                    control={healthProfileForm.control}
                                                                    name="conditions"
                                                                    render={({ field }) => {
                                                                        return (
                                                                            <FormItem
                                                                                key={condition}
                                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(condition)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            return checked
                                                                                                ? field.onChange([...field.value, condition])
                                                                                                : field.onChange(
                                                                                                    field.value?.filter(
                                                                                                        (value: any) => value !== condition
                                                                                                    )
                                                                                                )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="text-sm font-normal">
                                                                                    {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        )
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Allergies */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Food Allergies</h4>
                                            <FormField
                                                control={healthProfileForm.control}
                                                name="allergies"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {(['nuts', 'dairy', 'gluten', 'shellfish', 'soy', 'eggs'] as const).map((allergy) => (
                                                                <FormField
                                                                    key={allergy}
                                                                    control={healthProfileForm.control}
                                                                    name="allergies"
                                                                    render={({ field }) => {
                                                                        return (
                                                                            <FormItem
                                                                                key={allergy}
                                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(allergy)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            return checked
                                                                                                ? field.onChange([...field.value, allergy])
                                                                                                : field.onChange(
                                                                                                    field.value?.filter(
                                                                                                        (value: any) => value !== allergy
                                                                                                    )
                                                                                                )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="text-sm font-normal capitalize">
                                                                                    {allergy}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        )
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Dietary Restrictions */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Dietary Restrictions</h4>
                                            <FormField
                                                control={healthProfileForm.control}
                                                name="dietaryRestrictions"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {(['vegan', 'vegetarian', 'keto', 'paleo', 'mediterranean', 'low_carb', 'dash', 'halal', 'kosher'] as const).map((diet) => (
                                                                <FormField
                                                                    key={diet}
                                                                    control={healthProfileForm.control}
                                                                    name="dietaryRestrictions"
                                                                    render={({ field }) => {
                                                                        return (
                                                                            <FormItem
                                                                                key={diet}
                                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(diet)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            return checked
                                                                                                ? field.onChange([...field.value, diet])
                                                                                                : field.onChange(
                                                                                                    field.value?.filter(
                                                                                                        (value: any) => value !== diet
                                                                                                    )
                                                                                                )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="text-sm font-normal capitalize">
                                                                                    {diet.replace(/_/g, ' ')}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        )
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Organic Food Preference */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">🥬 Organic Food Preference</h4>
                                            <FormField
                                                control={healthProfileForm.control}
                                                name="organicPreference"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                className="space-y-3"
                                                                data-testid="radio-organic-preference"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="standard_only" id="standard_only" />
                                                                    <Label htmlFor="standard_only" className="font-normal cursor-pointer">
                                                                        <div>
                                                                            <div className="font-medium">Only Standard Food</div>
                                                                            <div className="text-sm text-muted-foreground">Choose conventional food options only</div>
                                                                        </div>
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="prefer_when_budget_allows" id="prefer_when_budget_allows" />
                                                                    <Label htmlFor="prefer_when_budget_allows" className="font-normal cursor-pointer">
                                                                        <div>
                                                                            <div className="font-medium">Prefer Organic Foods</div>
                                                                            <div className="text-sm text-muted-foreground">When budget allows, prioritize organic options</div>
                                                                        </div>
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="organic_only" id="organic_only" />
                                                                    <Label htmlFor="organic_only" className="font-normal cursor-pointer">
                                                                        <div>
                                                                            <div className="font-medium">Organic Food Only</div>
                                                                            <div className="text-sm text-muted-foreground">Purchase only certified organic food products</div>
                                                                        </div>
                                                                    </Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Goals */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Health Goals</h4>
                                            <FormField
                                                control={healthProfileForm.control}
                                                name="goals"
                                                render={() => (
                                                    <FormItem>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {(['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'control_blood_sugar', 'lower_cholesterol', 'reduce_sodium', 'general_wellness', 'healthy_family_eating'] as const).map((goal) => (
                                                                <FormField
                                                                    key={goal}
                                                                    control={healthProfileForm.control}
                                                                    name="goals"
                                                                    render={({ field }) => {
                                                                        return (
                                                                            <FormItem
                                                                                key={goal}
                                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(goal)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            return checked
                                                                                                ? field.onChange([...field.value, goal])
                                                                                                : field.onChange(
                                                                                                    field.value?.filter(
                                                                                                        (value: any) => value !== goal
                                                                                                    )
                                                                                                )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="text-sm font-normal">
                                                                                    {goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        )
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Privacy Settings */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Privacy Settings</h4>
                                            <FormField
                                                control={healthProfileForm.control}
                                                name="privacyLevel"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Health Data Visibility</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select privacy level" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="private">Private (only me)</SelectItem>
                                                                <SelectItem value="admin_only">Admin Only</SelectItem>
                                                                <SelectItem value="shared">Shared with all members</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Food Preferences */}
                                        <div className="space-y-4">
                                            <h4 className="font-medium">Food Preferences</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Manage food exclusions, inclusions, and dietary preferences for personalized meal planning
                                            </p>
                                            {
                                                Object.keys(healthProfileForm).length > 0 &&
                                                <FoodPreferencesForm
                                                    excludedFoods={healthProfileForm.watch('excludedFoods')}
                                                    includedFoods={healthProfileForm.watch('includedFoods')}
                                                    customExclusions={healthProfileForm.watch('customExclusions')}
                                                    customInclusions={healthProfileForm.watch('customInclusions')}
                                                    preferenceSets={healthProfileForm.watch('preferenceSets')}
                                                    autoLearn={healthProfileForm.watch('autoLearn')}
                                                    autoSwap={healthProfileForm.watch('autoSwap')}
                                                    onExcludedFoodsChange={(foods) => healthProfileForm.setValue('excludedFoods', foods)}
                                                    onIncludedFoodsChange={(foods) => healthProfileForm.setValue('includedFoods', foods)}
                                                    onCustomExclusionsChange={(exclusions) => healthProfileForm.setValue('customExclusions', exclusions)}
                                                    onCustomInclusionsChange={(inclusions) => healthProfileForm.setValue('customInclusions', inclusions)}
                                                    onPreferenceSetsChange={(sets) => healthProfileForm.setValue('preferenceSets', sets)}
                                                    onAutoLearnChange={(value) => healthProfileForm.setValue('autoLearn', value)}
                                                    onAutoSwapChange={(value) => healthProfileForm.setValue('autoSwap', value)}
                                                />
                                            }

                                        </div>
                                    </form>
                                </Form>
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>

                <div className="border-t bg-background px-6 py-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={healthProfileForm.handleSubmit(onSubmit)} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
