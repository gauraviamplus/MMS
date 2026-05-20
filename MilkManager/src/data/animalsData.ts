export interface Animal {
  id: string;
  name: string;
  type: "cow" | "buffalo";
  age: number; // years
}

export const ANIMALS_LIST: Animal[] = [
  { id: "A001", name: "Bella", type: "cow",     age: 4 },
  { id: "A002", name: "Daisy", type: "cow",     age: 3 },
  { id: "A003", name: "Rocky", type: "buffalo", age: 5 },
  { id: "A004", name: "Luna",  type: "buffalo", age: 4 },
];
