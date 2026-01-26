import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Modal,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Progress,
    ProgressBar
} from '@/components/ui';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function UITestScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <ScrollView className="flex-1 bg-steam-950">
      <View className="p-4 gap-6">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-brass-300 font-steampunk">
            UI Components Test
          </Text>
          <Text className="text-brass-100/70">
            Testing base components with Steampunk theme
          </Text>
        </View>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              <Button>Default Button</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Button</Button>
              <View className="flex-row gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>Test modal dialog</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onPress={() => setModalVisible(true)}>Open Modal</Button>
          </CardContent>
        </Card>

        <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <ModalHeader onClose={() => setModalVisible(false)}>
            <ModalTitle>Test Modal</ModalTitle>
            <ModalDescription>This is a test modal with Steampunk styling</ModalDescription>
          </ModalHeader>
          <ModalContent>
            <Text className="text-brass-100">
              Modal content goes here. This modal has a dark background with brass accents.
            </Text>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button onPress={() => setModalVisible(false)}>Confirm</Button>
          </ModalFooter>
        </Modal>

        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
            <CardDescription>Text input with validation</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              <Input
                label="Username"
                placeholder="Enter username"
                value={inputValue}
                onChangeText={setInputValue}
                helperText="Choose a unique username"
              />
              <Input
                label="Password"
                placeholder="Enter password"
                secureTextEntry
                helperText="At least 8 characters"
              />
              <Input
                label="Error Example"
                placeholder="This has an error"
                error="This field is required"
              />
              <Input label="Disabled" placeholder="Disabled input" editable={false} />
            </View>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Bars</CardTitle>
            <CardDescription>Health, mana, and experience bars</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <ProgressBar
                current={75}
                max={100}
                variant="health"
                label="Health"
                showValues
              />
              <ProgressBar current={50} max={100} variant="mana" label="Mana" showValues />
              <ProgressBar
                current={350}
                max={1000}
                variant="experience"
                label="Experience"
                showValues
              />
              <Progress value={25} variant="warning" size="sm" />
              <Progress value={50} variant="default" size="default" />
              <Progress value={75} variant="success" size="lg" />
              <Progress value={90} variant="danger" size="xl" />
            </View>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <View className="gap-3">
          <Card variant="default">
            <CardContent>
              <Text className="text-brass-100">Default Card</Text>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent>
              <Text className="text-brass-100">Elevated Card</Text>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Text className="text-brass-100">Outlined Card</Text>
            </CardContent>
          </Card>
          <Card variant="ghost">
            <CardContent>
              <Text className="text-brass-100">Ghost Card</Text>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
