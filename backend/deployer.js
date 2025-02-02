function deploymentPicker(frontend, backend) {
  switch (frontend) {
    case "react":
      switch (backend) {
        case "node":
          return "./deployment-configs/deploy-react-node.yaml";
        case "flask":
          return "./deployment-configs/deploy-react-flask.yaml";
        default:
          return null;
      }
      break;
    case "angular":
      switch (backend) {
        case "node":
          return "./deployment-configs/deploy-angular-node.yaml";
        case "flask":
          return "./deployment-configs/deploy-angular-flask.yaml";
        default:
          return null;
      }
      break;

    default:
      return null;
  }
}
