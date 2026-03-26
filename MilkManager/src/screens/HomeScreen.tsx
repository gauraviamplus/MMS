import React from "react";
import { ScrollView, SafeAreaView } from "react-native";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
  Badge,
} from "../components/ui";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6">
        <Text variant="h2" className="mb-2">Welcome to Milk Manager</Text>
        <Text variant="muted" className="mb-6">
          Get started by editing this screen
        </Text>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Your first card component</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge className="mb-3">New</Badge>
            <Text className="text-foreground mb-4">
              This is built with React Native, NativeWind (Tailwind CSS), and
              shadcn-style components.
            </Text>
            <Button onPress={() => {}}>Get Started</Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
