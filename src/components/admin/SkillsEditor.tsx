import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  percentage: number;
  sort_order: number;
  is_active: boolean;
}

const SkillsEditor = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newName, setNewName] = useState('');
  const [newPercentage, setNewPercentage] = useState(50);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPercentage, setEditPercentage] = useState(50);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) {
      toast.error('Failed to load skills');
      return;
    }
    setSkills(data || []);
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error('Please enter a skill name');
      return;
    }

    const { error } = await supabase.from('skills').insert([{
      name,
      percentage: newPercentage,
      sort_order: skills.length,
    }]);

    if (error) {
      toast.error('Failed to add skill');
      return;
    }

    toast.success('Skill added');
    setNewName('');
    setNewPercentage(50);
    loadSkills();
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditPercentage(skill.percentage);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) {
      toast.error('Skill name cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('skills')
      .update({ name, percentage: editPercentage })
      .eq('id', editingId);

    if (error) {
      toast.error('Failed to update skill');
      return;
    }

    toast.success('Skill updated');
    setEditingId(null);
    setEditName('');
    setEditPercentage(50);
    loadSkills();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('skills')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete skill');
      return;
    }

    toast.success('Skill deleted');
    loadSkills();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Skill name (e.g., Python)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium mb-2">
                Proficiency: {newPercentage}%
              </label>
              <Slider
                value={[newPercentage]}
                onValueChange={(v) => setNewPercentage(v[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                {editingId === skill.id ? (
                  <div className="flex-1 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Proficiency: {editPercentage}%
                      </label>
                      <Slider
                        value={[editPercentage]}
                        onValueChange={(v) => setEditPercentage(v[0])}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{skill.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${skill.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{skill.percentage}%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsEditor;
