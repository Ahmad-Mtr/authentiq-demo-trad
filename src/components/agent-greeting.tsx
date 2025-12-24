import { Waypoints, Zap } from "lucide-react";
import React from "react";
const getTimeBasedGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good Morning";
  } else if (currentHour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

const AgentGreeting = () => {
  return (
    <div className="">
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        {/* <Zap className="size-12 text-muted-foreground mb-4" /> */}
        <h1 className="text-2xl md:text-4xl font-semibold font-raleway mb-2">
          {getTimeBasedGreeting() || "Greetings, "}, Ready to hire?
        </h1>
        <p className="text-muted-foreground mb-6 max-w-lg">
          Paste your job description or describe your ideal candidate so our AI
          agent find, shortlist, and compare the best from this network for you.
        </p>
      </div>
    </div>
  );
};

export default AgentGreeting;
