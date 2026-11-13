import React from "react";
import CrowdBadge from "../components/CrowdBadge.jsx";
import StockChip from "../components/StockChip.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

export default function Design() {
  const fresh = Date.now() - 2 * 60 * 1000;
  const stale = Date.now() - 35 * 60 * 1000;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Shared Design System (/design)</h1>

      <Card className="space-y-3">
        <h2 className="font-bold">CrowdBadge States</h2>
        <div className="flex flex-wrap gap-3">
          <CrowdBadge level="low" updatedAt={fresh} />
          <CrowdBadge level="medium" updatedAt={fresh} />
          <CrowdBadge level="high" updatedAt={fresh} />
          <CrowdBadge level="low" updatedAt={stale} />
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold">StockChip States</h2>
        <div className="flex flex-wrap gap-3">
          <StockChip status="in" />
          <StockChip status="low" />
          <StockChip status="out" />
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-bold">Buttons (Min 44px Touch Height)</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="danger">Danger Action</Button>
        </div>
      </Card>
    </main>
  );
}
