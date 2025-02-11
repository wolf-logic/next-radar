import PropTypes from "prop-types";
import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NotFoundMessage({ message = "No page at this location." }) {
  return (
    <Alert variant="destructive" className="m-8 max-w-md">
      <Lock className="h-4 w-4" />
      <AlertTitle>Not Found</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

NotFoundMessage.propTypes = {
  message: PropTypes.string
};
