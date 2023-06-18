import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";

/**
 * make an extrinsic of treasury proposal submission for council member.
 */
async function makeTreasuryProposalSubmission(api: ApiPromise, id: any, isReject: boolean): Promise<SubmittableExtrinsic<"promise">> {
  const members = await (api.query.electionsPhragmen || api.query.elections || api.query.phragmenElection).members<any[]>();
  const councilThreshold = Math.ceil(members.length * 0.6);
  const proposal = isReject ? api.tx.treasury.rejectProposal(id) : api.tx.treasury.approveProposal(id);
  return api.tx.council.propose(councilThreshold, proposal, proposal.length);
}

export default {
  makeTreasuryProposalSubmission
}