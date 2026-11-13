import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { FrontlineTab } from '@/components/FrontlineTab';
import { CrystallineConflictTab } from '@/components/CrystallineConflictTab';
import { Shield, Gem } from 'lucide-react';
import { TabType } from '@/hooks/useSettings';

export function MainContent() {
  const { t, activeTab, updateSettings } = useSettingsContext();
  const shouldReduceMotion = useReducedMotion();

  const motionDuration = shouldReduceMotion ? 0 : 0.16;
  const xOffset = shouldReduceMotion ? 0 : 10;

  return (
    <main className="w-full flex-1 md:min-h-0 md:overflow-y-auto overflow-x-clip">
      <div className="container max-w-screen-2xl px-4 py-5 sm:py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => updateSettings({ activeTab: value as TabType })}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-5 sm:mb-6">
            <TabsTrigger value="frontline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>{t.frontlineShort}</span>
            </TabsTrigger>
            <TabsTrigger value="cc" className="flex items-center gap-2">
              <Gem className="h-4 w-4" />
              <span>{t.crystallineConflictShort}</span>
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'frontline' ? (
                <motion.div
                  key="frontline"
                  initial={{ opacity: 0, x: -xOffset }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: xOffset }}
                  transition={{ duration: motionDuration, ease: 'easeOut' }}
                  className="w-full"
                >
                  <TabsContent value="frontline" forceMount className="mt-0">
                    <FrontlineTab />
                  </TabsContent>
                </motion.div>
              ) : (
                <motion.div
                  key="cc"
                  initial={{ opacity: 0, x: xOffset }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -xOffset }}
                  transition={{ duration: motionDuration, ease: 'easeOut' }}
                  className="w-full"
                >
                  <TabsContent value="cc" forceMount className="mt-0">
                    <CrystallineConflictTab />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
