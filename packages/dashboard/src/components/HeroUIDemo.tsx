import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Avatar,
  Progress,
  Tabs,
  Tab,
  Badge,
  Switch,
} from '@heroui/react';

export const HeroUIDemo: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              HeroUI Demo
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showcasing HeroUI components in Miyabi Dashboard
            </p>
          </div>
          <Switch
            isSelected={darkMode}
            onValueChange={setDarkMode}
            size="lg"
          >
            Dark Mode
          </Switch>
        </div>

        {/* Tabs */}
        <Tabs aria-label="Demo sections" color="primary" variant="bordered">
          <Tab key="buttons" title="Buttons">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Button Variants</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-4">
                  <Button color="default">Default</Button>
                  <Button color="primary">Primary</Button>
                  <Button color="secondary">Secondary</Button>
                  <Button color="success">Success</Button>
                  <Button color="warning">Warning</Button>
                  <Button color="danger">Danger</Button>
                  <Button variant="bordered">Bordered</Button>
                  <Button variant="flat">Flat</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button isLoading>Loading</Button>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="agents" title="Agent Cards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CoordinatorAgent Card */}
              <Card>
                <CardHeader className="flex gap-3">
                  <Avatar
                    isBordered
                    color="secondary"
                    name="Co"
                    size="md"
                  />
                  <div className="flex flex-col">
                    <p className="text-md font-semibold">CoordinatorAgent</p>
                    <Badge color="secondary" variant="flat">
                      しきるん
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    タスク統括・DAG分解を担当するリーダーAgent
                  </p>
                  <Progress
                    label="Active Tasks"
                    value={75}
                    color="secondary"
                    className="mt-4"
                  />
                </CardBody>
              </Card>

              {/* CodeGenAgent Card */}
              <Card>
                <CardHeader className="flex gap-3">
                  <Avatar
                    isBordered
                    color="primary"
                    name="CG"
                    size="md"
                  />
                  <div className="flex flex-col">
                    <p className="text-md font-semibold">CodeGenAgent</p>
                    <Badge color="primary" variant="flat">
                      つくるん
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI駆動コード生成を実行する実行役Agent
                  </p>
                  <Progress
                    label="Code Quality"
                    value={92}
                    color="primary"
                    className="mt-4"
                  />
                </CardBody>
              </Card>

              {/* ReviewAgent Card */}
              <Card>
                <CardHeader className="flex gap-3">
                  <Avatar
                    isBordered
                    color="success"
                    name="RV"
                    size="md"
                  />
                  <div className="flex flex-col">
                    <p className="text-md font-semibold">ReviewAgent</p>
                    <Badge color="success" variant="flat">
                      めだまん
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    コード品質レビューを担当する検査役Agent
                  </p>
                  <Progress
                    label="Review Score"
                    value={88}
                    color="success"
                    className="mt-4"
                  />
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="inputs" title="Inputs & Forms">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Form Elements</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="GitHub Token"
                    placeholder="ghp_xxxxx"
                    type="password"
                    variant="bordered"
                  />
                  <Input
                    label="Project Name"
                    placeholder="Enter your project name"
                    variant="flat"
                  />
                  <Input
                    label="Repository URL"
                    placeholder="https://github.com/..."
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">🔗</span>
                      </div>
                    }
                  />
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="status" title="Status & States">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">State Chips</h3>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-3">
                  <Chip color="default" variant="flat">
                    📥 Pending
                  </Chip>
                  <Chip color="primary" variant="flat">
                    🔍 Analyzing
                  </Chip>
                  <Chip color="secondary" variant="flat">
                    🏗️ Implementing
                  </Chip>
                  <Chip color="warning" variant="flat">
                    👀 Reviewing
                  </Chip>
                  <Chip color="success" variant="flat">
                    ✅ Done
                  </Chip>
                  <Chip color="danger" variant="flat">
                    🚨 Failed
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>

        {/* Footer */}
        <Card>
          <CardBody>
            <div className="text-center">
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                HeroUI successfully integrated into Miyabi Dashboard ✨
              </p>
              <p className="text-sm mt-2">
                <a
                  href="https://www.heroui.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  HeroUI Documentation
                </a>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default HeroUIDemo;
