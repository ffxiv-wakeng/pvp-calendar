import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';

const Index = () => {
  return (
    <div className="min-h-dvh md:h-dvh md:overflow-hidden flex flex-col bg-background">
      {/* 柔和的背景氛围层 */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.07),transparent_60%)]" />
      </div>

      <Header />
      <MainContent />

      {/* 页脚 */}
      <footer className="mt-auto shrink-0 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-muted-foreground border-t border-border/40 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <p className="max-w-screen-xl mx-auto text-pretty leading-relaxed">
          Created and maintained by Inf Sein. Some content on this site includes materials from FINAL FANTASY XIV, and all related assets belongs to SQUARE ENIX CO., LTD.
        </p>
      </footer>
    </div>
  );
};

export default Index;
