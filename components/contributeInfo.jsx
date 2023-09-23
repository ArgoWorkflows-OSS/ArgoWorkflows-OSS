import { useCallback, useEffect, useState, useRef } from 'react';
// import axios from 'axios';
import { Octokit } from 'octokit';
import Table from './common/table';

const gitProfileBuilder = userInfo => (
  <div className="flex items-center">
    <div className="w-7 h-7 flex-shrink-0 mr-2 sm:mr-3">
      <img className="rounded-full" src={userInfo.avatar_url} alt={userInfo.login} />
    </div>
    <div className="font-medium text-gray-800">{userInfo.login}</div>
  </div>
);

const gitIssueSummaryBuilder = issueInfo => (
  <a key={issueInfo.id} href={issueInfo.html_url} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
    {issueInfo.title}
  </a>
);

const gitIssueTypeBuilder = (issueTypeInfo, cloasedAt) => {
  const margedLabel = <span className="text-[8px] font-semibold inline-block py-[1px] px-1 rounded-full text-blue-600 bg-blue-200 last:mr-0 mr-1">MERGED</span>;
  const openedLabel = <span className="text-[8px] font-semibold inline-block py-[1px] px-1 rounded-full text-green-800 bg-green-300 last:mr-0 mr-1">OPENED</span>;
  const closedLabel = <span className="text-[8px] font-semibold inline-block py-[1px] px-1 rounded-full text-red-600 bg-red-200 last:mr-0 mr-1">CLOSED</span>;

  const prMarged = (
    <div>
      <span className="mr-1 font-semibold">PR</span>
      {margedLabel}
    </div>
  );
  const prOpened = (
    <div>
      <span className="mr-1 font-semibold">PR</span>
      {openedLabel}
    </div>
  );

  const prClosed = (
    <div>
      <span className="mr-1 font-semibold">PR</span>
      {closedLabel}
    </div>
  );

  const issue = (
    <div>
      <span className="mr-1 font-semibold">ISSUE</span>
    </div>
  );

  const issueType = issueTypeInfo ? (issueTypeInfo.merged_at ? prMarged : cloasedAt ? prClosed : prOpened) : issue;
  return issueType;
};

const ContributeInfo = ({ contributers = [] }) => {
  const [issueList, setIssueList] = useState([]);

  const gitIssueBuilder = useCallback(async githubId => {
    const octokit = new Octokit({});
    const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner: 'argoproj',
      repo: 'argo-workflows',
      creator: githubId,
      state: 'all',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const issueObj = response.data;

    return issueObj.map(issue => [gitProfileBuilder(issue.user), gitIssueTypeBuilder(issue.pull_request, issue.closed_at), gitIssueSummaryBuilder(issue)]);
  }, []);

  const { current: contributersRef } = useRef(contributers);

  useEffect(() => {
    contributersRef.map(contributer => {
      gitIssueBuilder(contributer).then(data => {
        setIssueList(prev => [...prev, ...data]);
      });
      return null;
    });
  }, [contributersRef, gitIssueBuilder, setIssueList]);

  return <Table tableTitle="Contribute Info" colums={['GitHub', 'Type', 'Summary']} rows={issueList} />;
};

export default ContributeInfo;
