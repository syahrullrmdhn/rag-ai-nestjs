import React from "react";
import { Card, CardBody, CardHeader } from "../components/ui";

export default function OverviewPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader title="Quick Actions" subtitle="Start from Knowledge then ask Chat." />
        <CardBody className="text-sm text-black/70 space-y-2">
          <div>• Upload/Paste knowledge in <span className="font-medium">Knowledge</span></div>
          <div>• Verify <span className="font-medium">Settings</span> (API key, models)</div>
          <div>• Ask questions in <span className="font-medium">Chat</span></div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Status" subtitle="This is a lightweight console UI." />
        <CardBody className="text-sm text-black/70">
          Keep in mind: PDF ingestion may still be pending depending on backend pipeline.
        </CardBody>
      </Card>
    </div>
  );
}
