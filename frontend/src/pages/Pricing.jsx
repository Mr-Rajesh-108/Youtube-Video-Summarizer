import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { FaCheck } from "react-icons/fa"

export function Pricing() {
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Refined Access for Digital Curators</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the tier that fits your workflow. Upgrade or downgrade at any time.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        {/* Free Tier */}
        <Card className="relative overflow-hidden border-2 flex flex-col">
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl mb-2">Basic</CardTitle>
            <CardDescription className="text-base">For casual users evaluating the AI.</CardDescription>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground text-sm font-medium">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span><strong>5</strong> AI Summaries per day</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span>Up to <strong>30 minute</strong> videos</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span>Standard processing speed</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span>Basic Chat functionality</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button className="w-full" variant="outline" size="lg">Current Plan</Button>
          </CardFooter>
        </Card>

        {/* Pro Tier */}
        <Card className="relative overflow-hidden border-primary border-2 shadow-xl flex flex-col">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-bl-lg">
            Popular
          </div>
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl mb-2 text-primary">Pro</CardTitle>
            <CardDescription className="text-base">Unlimited power for researchers & curators.</CardDescription>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">$12</span>
              <span className="text-muted-foreground text-sm font-medium">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-8">
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span><strong>Unlimited</strong> AI Summaries</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span><strong>Unlimited</strong> video length</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span>Priority GPU processing</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary text-base" /> <span>Advanced Chat & PDF Export</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <Button className="w-full" size="lg">Upgrade to Pro</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Granular details as mentioned in subagent log */}
      <h3 className="text-center text-2xl font-bold mb-8">Feature Breakdown</h3>
      {/* Table could go here if more detail is needed */}
    </div>
  )
}
