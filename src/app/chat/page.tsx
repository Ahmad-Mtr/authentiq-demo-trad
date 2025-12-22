"use client";
import { Button } from "@/components/ui/button";
import React, { useReducer, useState } from "react";

const page = () => {
  function reducer(
    state: { count: number; prefferedVegetable: string; name: string },
    action: { type: string }
  ) {
    switch (action.type) {
      case "increment":
        return { ...state, count: state.count + 1 };
    case "decrement":
      return { ...state, prefferedVegetable: "Pickle", count: state.count - 1 };
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = useReducer(reducer, { count: 0, prefferedVegetable: "Batata", name: "Kousa" });
  //   const [state, setState] = useState(0);

  //   const handleIncrement = () => {
  //     setState(state + 1);
  //     console.log(state);
  //   };

  //   const handleDecrement = () => {
  //     setState(state - 1);
  //     console.log(state);
  //   };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center ">
      <div className="my-3">{state.count} {state.prefferedVegetable}</div>
      <Button onClick={() => dispatch({ type: "increment" })}>+</Button>

      <Button
        onClick={() => dispatch({ type: "decrement" })}
        variant={"secondary"}
      >
        -
      </Button>
    </div>
  );
};

export default page;
