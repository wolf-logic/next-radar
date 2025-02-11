import PropTypes from "prop-types";
import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NotImplementedMessage({ message = "This page has not been implemented, yet." }) {
  return (
    <Alert variant="destructive" className="m-8 max-w-md">
      <Lock className="h-4 w-4" />
      <AlertTitle>Not Implemented</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

NotImplementedMessage.propTypes = {
  message: PropTypes.string
};
