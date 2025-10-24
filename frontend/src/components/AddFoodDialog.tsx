import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { indianFoodDatabase } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface AddFoodDialogProps {
  onAddFood: (food: any) => void;
}

export default function AddFoodDialog({ onAddFood }: AddFoodDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');

  const filteredFoods = indianFoodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = () => {
    if (!selectedFood || !quantity || !unit) {
      toast({
        title: "Missing Information",
        description: "Please select a food item, quantity, and unit.",
        variant: "destructive"
      });
      return;
    }

    const multiplier = parseFloat(quantity);
    const newFoodItem = {
      id: `custom-${Date.now()}`,
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
      quantity: parseFloat(quantity),
      unit: unit
    };

    onAddFood(newFoodItem);
    toast({
      title: "Food Added",
      description: `${selectedFood.name} has been added to your meal.`
    });

    // Reset form
    setSelectedFood(null);
    setQuantity('1');
    setUnit('');
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Food Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Food Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Food Items</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for Indian foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Food Selection */}
          {searchQuery && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <Label>Select Food ({filteredFoods.length} results)</Label>
              <div className="grid gap-2">
                {filteredFoods.map((food) => (
                  <Card 
                    key={food.id}
                    className={`cursor-pointer transition-all ${
                      selectedFood?.id === food.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedFood(food)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{food.name}</h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {food.category}
                          </Badge>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{food.calories} kcal</div>
                          <div className="text-muted-foreground">
                            P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Unit */}
          {selectedFood && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select onValueChange={setUnit} value={unit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bowl">Bowl</SelectItem>
                    <SelectItem value="cup">Cup</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                    <SelectItem value="tablespoon">Tablespoon</SelectItem>
                    <SelectItem value="teaspoon">Teaspoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedFood && quantity && unit && (
            <Card className="bg-muted/20">
              <CardContent className="p-3">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{selectedFood.name}</span>
                    <span className="text-muted-foreground"> - {quantity} {unit}</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {Math.round(selectedFood.calories * parseFloat(quantity))} kcal
                    </div>
                    <div className="text-muted-foreground">
                      P: {Math.round(selectedFood.protein * parseFloat(quantity) * 10) / 10}g
                      {' '}C: {Math.round(selectedFood.carbs * parseFloat(quantity) * 10) / 10}g
                      {' '}F: {Math.round(selectedFood.fat * parseFloat(quantity) * 10) / 10}g
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAddFood}
              disabled={!selectedFood || !quantity || !unit}
              className="flex-1"
            >
              Add to Meal
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}