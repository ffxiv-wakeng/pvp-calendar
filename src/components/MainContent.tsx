import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { FrontlineTab } from '@/components/FrontlineTab';
import { CrystallineConflictTab } from '@/components/CrystallineConflictTab';
import { Shield, Gem } from 'lucide-react';
import { TabType } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

export function MainContent() {
  const { t, activeTab, updateSettings } = useSettingsContext();

  return (
    <main className="container max-w-screen-2xl px-4 py-6">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => updateSettings({ activeTab: value as TabType })}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="frontline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>{t.frontlineShort}</span>
          </TabsTrigger>
          <TabsTrigger value="cc" className="flex items-center gap-2">
            <Gem className="h-4 w-4" />
            <span>{t.crystallineConflictShort}</span>
          </TabsTrigger>
        </TabsList>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'frontline' ? (
              <motion.div
                key="frontline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                <TabsContent value="frontline" forceMount className="mt-0">
                  <FrontlineTab />
                </TabsContent>
              </motion.div>
            ) : (
              <motion.div
                key="cc"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
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
    </main>
  );
}
