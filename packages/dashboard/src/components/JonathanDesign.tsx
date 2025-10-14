import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Avatar,
  Badge,
  Divider,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';

// ジョナサン・アイブスタイル：ミニマル、エレガント、機能的
// Apple的な洗練されたデザインを実現

interface Agent {
  id: string;
  name: string;
  characterName: string;
  status: 'idle' | 'executing' | 'completed' | 'failed';
  progress: number;
  tasksCompleted: number;
  efficiency: number;
  color: string;
}

const agents: Agent[] = [
  {
    id: '1',
    name: 'CoordinatorAgent',
    characterName: 'しきるん',
    status: 'executing',
    progress: 75,
    tasksCompleted: 12,
    efficiency: 94,
    color: '#FF79C6',
  },
  {
    id: '2',
    name: 'CodeGenAgent',
    characterName: 'つくるん',
    status: 'executing',
    progress: 60,
    tasksCompleted: 8,
    efficiency: 98,
    color: '#00D9FF',
  },
  {
    id: '3',
    name: 'ReviewAgent',
    characterName: 'めだまん',
    status: 'completed',
    progress: 100,
    tasksCompleted: 15,
    efficiency: 92,
    color: '#00FF88',
  },
  {
    id: '4',
    name: 'UIUXAgent',
    characterName: 'みためん',
    status: 'idle',
    progress: 0,
    tasksCompleted: 5,
    efficiency: 88,
    color: '#A78BFA',
  },
  {
    id: '5',
    name: 'HeroUIAgent',
    characterName: 'ひーろー',
    status: 'executing',
    progress: 85,
    tasksCompleted: 10,
    efficiency: 96,
    color: '#EC4899',
  },
];

const statusConfig = {
  idle: {
    label: 'Standby',
    color: 'default' as const,
    gradient: 'from-gray-500 to-gray-600',
    icon: '⏸',
  },
  executing: {
    label: 'Executing',
    color: 'primary' as const,
    gradient: 'from-blue-500 to-purple-600',
    icon: '▶',
  },
  completed: {
    label: 'Complete',
    color: 'success' as const,
    gradient: 'from-green-400 to-emerald-600',
    icon: '✓',
  },
  failed: {
    label: 'Failed',
    color: 'danger' as const,
    gradient: 'from-red-500 to-rose-600',
    icon: '✕',
  },
};

export const JonathanDesign: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeAgents = agents.filter((a) => a.status === 'executing').length;
  const avgEfficiency = Math.round(
    agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length
  );
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-auto">
      {/* Hero Section - ジョナサン・アイブスタイル */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Minimalist header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-gray-900 dark:text-white mb-4">
              Autonomous
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-light">
                Operations
              </span>
            </h1>
            <p className="text-lg md:text-xl font-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Designed by Jonathan, powered by HeroUI.
              <br />
              Minimal. Elegant. Powerful.
            </p>
          </motion.div>

          {/* Stats Cards - Apple Card style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { label: 'Active Agents', value: activeAgents, icon: '🤖', color: 'from-blue-500 to-cyan-500' },
              { label: 'Avg Efficiency', value: `${avgEfficiency}%`, icon: '⚡', color: 'from-purple-500 to-pink-500' },
              { label: 'Tasks Done', value: totalTasks, icon: '✓', color: 'from-green-500 to-emerald-500' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-none shadow-xl">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-extralight text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl shadow-lg`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Controls - Minimal floating bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <Tabs
            selectedKey={viewMode}
            onSelectionChange={(key) => setViewMode(key as 'grid' | 'list')}
            variant="light"
            classNames={{
              tabList: 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-1 rounded-full shadow-lg',
              tab: 'font-light',
            }}
          >
            <Tab key="grid" title="Grid View" />
            <Tab key="list" title="List View" />
          </Tabs>

          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl font-light"
              >
                Actions ▾
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Actions">
              <DropdownItem key="start">Start All Agents</DropdownItem>
              <DropdownItem key="pause">Pause All</DropdownItem>
              <DropdownItem key="reset">Reset Tasks</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </motion.div>

        {/* Agent Cards */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {agents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedAgent(agent)}
                  className="cursor-pointer"
                >
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-none shadow-xl hover:shadow-2xl transition-all">
                    <CardBody className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            style={{ backgroundColor: agent.color }}
                            name={agent.characterName[0]}
                            size="lg"
                            className="ring-2 ring-white dark:ring-gray-800"
                          />
                          <div>
                            <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                              {agent.name}
                            </p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                              {agent.characterName}
                            </p>
                          </div>
                        </div>
                        <Chip
                          variant="flat"
                          color={statusConfig[agent.status].color}
                          size="sm"
                          startContent={
                            <span className="text-xs">{statusConfig[agent.status].icon}</span>
                          }
                          classNames={{
                            base: 'backdrop-blur-xl',
                            content: 'font-light',
                          }}
                        >
                          {statusConfig[agent.status].label}
                        </Chip>
                      </div>

                      {/* Progress */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-light text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {agent.progress}%
                            </span>
                          </div>
                          <Progress
                            value={agent.progress}
                            color={statusConfig[agent.status].color}
                            className="h-1.5"
                            classNames={{
                              indicator: 'rounded-full',
                            }}
                          />
                        </div>

                        <Divider className="my-3" />

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-xs font-light text-gray-600 dark:text-gray-400">
                              Tasks
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {agent.tasksCompleted}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-light text-gray-600 dark:text-gray-400">
                              Efficiency
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                              {agent.efficiency}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {agents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-none shadow-lg hover:shadow-xl transition-all">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          style={{ backgroundColor: agent.color }}
                          name={agent.characterName[0]}
                          size="md"
                          className="ring-2 ring-white dark:ring-gray-800"
                        />
                        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.characterName}
                            </p>
                            <p className="text-xs font-light text-gray-600 dark:text-gray-400">
                              {agent.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={agent.progress}
                              color={statusConfig[agent.status].color}
                              className="flex-1"
                              size="sm"
                            />
                            <span className="text-xs font-medium text-gray-900 dark:text-white w-12 text-right">
                              {agent.progress}%
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.efficiency}%
                            </p>
                            <p className="text-xs font-light text-gray-600 dark:text-gray-400">
                              Efficiency
                            </p>
                          </div>
                          <Chip
                            variant="flat"
                            color={statusConfig[agent.status].color}
                            size="sm"
                            classNames={{
                              content: 'font-light',
                            }}
                          >
                            {statusConfig[agent.status].label}
                          </Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Agent Detail - Modal style */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedAgent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
              >
                <Card className="bg-white dark:bg-gray-900 shadow-2xl">
                  <CardBody className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <Avatar
                          style={{ backgroundColor: selectedAgent.color }}
                          name={selectedAgent.characterName[0]}
                          size="lg"
                          className="ring-4 ring-white dark:ring-gray-800"
                        />
                        <div>
                          <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                            {selectedAgent.characterName}
                          </h3>
                          <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                            {selectedAgent.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        variant="light"
                        onPress={() => setSelectedAgent(null)}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-3">
                          Current Progress
                        </p>
                        <Progress
                          value={selectedAgent.progress}
                          color={statusConfig[selectedAgent.status].color}
                          size="lg"
                          showValueLabel
                          classNames={{
                            indicator: 'rounded-full',
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <p className="text-3xl font-light text-gray-900 dark:text-white">
                            {selectedAgent.tasksCompleted}
                          </p>
                          <p className="text-xs font-light text-gray-600 dark:text-gray-400 mt-1">
                            Tasks Completed
                          </p>
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <p className="text-3xl font-light text-gray-900 dark:text-white">
                            {selectedAgent.efficiency}%
                          </p>
                          <p className="text-xs font-light text-gray-600 dark:text-gray-400 mt-1">
                            Efficiency Rate
                          </p>
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <Chip
                            variant="flat"
                            color={statusConfig[selectedAgent.status].color}
                            size="lg"
                            classNames={{
                              content: 'font-light',
                            }}
                          >
                            {statusConfig[selectedAgent.status].label}
                          </Chip>
                          <p className="text-xs font-light text-gray-600 dark:text-gray-400 mt-2">
                            Current Status
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          color="primary"
                          variant="flat"
                          className="flex-1 font-light"
                        >
                          View Details
                        </Button>
                        <Button
                          color="secondary"
                          variant="flat"
                          className="flex-1 font-light"
                        >
                          Restart Task
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - Minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-sm font-light text-gray-600 dark:text-gray-400">
            Designed by ヒーローちゃん (Jonathan Style) ✨
            <br />
            <span className="text-xs">Powered by HeroUI × Framer Motion</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default JonathanDesign;
