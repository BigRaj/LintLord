import { app } from '@azure/functions';
import "./functions/KeyVaultTest";
import "./functions/GitHubPingTest";
import "./functions/PullRequestFileTest"

app.setup({
    enableHttpStream: true,
});
