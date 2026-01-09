import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <Header />
      <MainContent />
      
      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-xs text-muted-foreground border-t border-border/40">
        <p>Created and maintained by Inf Sein. Some content on this site includes materials from FINAL FANTASY XIV, and all related assets belongs to SQUARE ENIX CO., LTD.</p>
      </footer>
    </div>
  );
};

export default Index;
