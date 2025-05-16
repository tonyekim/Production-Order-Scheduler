import NavMenu from "../components/core/NavMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavMenu />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Production Order Scheduler &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}