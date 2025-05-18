
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-legally-950 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Leg<span className="text-legally-300">Ally</span> 
              <span className="block md:inline text-3xl md:text-4xl lg:text-5xl font-normal ml-0 md:ml-2 mt-2 md:mt-0">Workload</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-legally-100">
              Streamline your law firm's workflow and optimize team productivity
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-legally-600 hover:bg-legally-700 text-white px-8">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/assignments">
                <Button size="lg" variant="outline" className="border-legally-400 text-legally-200 hover:bg-legally-900 px-8">
                  Manage Assignments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-legally-900">Streamline Your Law Practice</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-legally-800">Smart Assignment Distribution</h3>
              <p className="text-muted-foreground">Intelligently distribute work based on expertise, capacity, and past performance to optimize productivity.</p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-legally-800">Team Collaboration</h3>
              <p className="text-muted-foreground">Facilitate collaboration by pairing attorneys with complementary skills for complex cases.</p>
            </div>
            
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-4 text-legally-800">Workload Management</h3>
              <p className="text-muted-foreground">Balance caseloads across your team to prevent burnout and ensure optimal resource utilization.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-legally-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-legally-900">Ready to optimize your firm's workflow?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-legally-800">
            Start managing your team's workload more effectively today.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-legally-700 hover:bg-legally-800 text-white px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-legally-900 text-white mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-xl">Leg<span className="text-legally-300">Ally</span> Workload</p>
              <p className="text-sm text-legally-300">Streamlining law firm operations</p>
            </div>
            <div className="text-sm text-legally-400">
              © 2025 LegAlly. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
