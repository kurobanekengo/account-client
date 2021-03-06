import * as Rx from "typeless/rx";
import { createModule, useActions as _useActions } from "typeless";
import { State, getInitialState } from "@module/state";
import { PresentationApi } from "@api/presentation/PresentationApi";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { JournalSearchRequest } from "@common/model/journal/JournalSearchRequest";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";
import { SummaryRequest } from "@common/model/presentation/SummaryRequest";
import { SummaryResponse } from "@common/model/presentation/SummaryResponse";

type NextActions = any[] | (() => any[]);
const callNextActions = (nextActions: NextActions | undefined) => {
  if (nextActions == null) {
    return [];
  }
  if (typeof nextActions === "function") {
    return nextActions();
  } else {
    return nextActions;
  }
};

const moduleSymbol = Symbol("account");
const [module, actions, state] = createModule(moduleSymbol)
  .withActions({
    loadInit: null,
    setInit: (initData: InitSearchResponse) => ({
      payload: { initData },
    }),
    loadLedger: (ledgerSearchRequest: LedgerSearchRequest) => ({
      payload: { ledgerSearchRequest },
    }),
    setLedger: (ledgerList: {
      all_count: number;
      list: LedgerSearchResponse[];
    }) => ({
      payload: { ledgerList },
    }),
    loadJournals: (journalSearchRequest: JournalSearchRequest) => ({
      payload: { journalSearchRequest },
    }),
    setJournals: (journalList: {
      all_count: number;
      list: JournalEntity[];
    }) => ({
      payload: { journalList },
    }),
    updateJournal: (
      id: number,
      journal: Partial<Omit<JournalEntity, "id">>,
      nextActions?: NextActions
    ) => ({
      payload: { id, journal, nextActions },
    }),
    deleteJournal: (id: number, nextActions?: NextActions) => ({
      payload: { id, nextActions },
    }),
    createLedger: (ledger: LedgerCreateRequest, nextActions?: NextActions) => ({
      payload: { ledger, nextActions },
    }),
    updateLedger: (
      id: number,
      ledger: Omit<LedgerUpdateRequest, "id">,
      nextActions?: NextActions
    ) => ({
      payload: { id, ledger, nextActions },
    }),
    setTmpLedgerCd: (tmpLedgerCd: string) => ({ payload: { tmpLedgerCd } }),
    loadSummary: (summaryRequest: SummaryRequest) => ({
      payload: { summaryRequest },
    }),
    setSummary: (summary: SummaryResponse) => ({
      payload: { summary },
    }),
  })
  .withState<State>();

module
  .epic()
  .on(actions.loadInit, () => {
    return Rx.fromPromise(PresentationApi.selectInit()).pipe(
      Rx.map((res) => {
        return [actions.setInit(res.data.body)];
      })
    );
  })
  .on(actions.loadLedger, ({ ledgerSearchRequest }) => {
    return Rx.fromPromise(
      PresentationApi.selectLedger(ledgerSearchRequest, {
        month: ledgerSearchRequest.month,
        page_no: ledgerSearchRequest.page_no,
        page_size: ledgerSearchRequest.page_size,
      })
    ).pipe(
      Rx.map((res) => {
        return [actions.setLedger(res.data.body)];
      })
    );
  })
  .on(actions.loadJournals, ({ journalSearchRequest }) => {
    return Rx.fromPromise(
      PresentationApi.selectJournal(journalSearchRequest, {
        latest_order: journalSearchRequest.latest_order,
        largest_order: journalSearchRequest.largest_order,
        page_no: journalSearchRequest.page_no,
        page_size: journalSearchRequest.page_size,
      })
    ).pipe(
      Rx.map((res) => {
        return [actions.setJournals(res.data.body)];
      })
    );
  })
  .on(actions.updateJournal, ({ id, journal, nextActions }) => {
    return Rx.fromPromise(PresentationApi.updateJournal(id, journal)).pipe(
      Rx.map(() => {
        return callNextActions(nextActions);
      })
    );
  })
  .on(actions.deleteJournal, ({ id, nextActions }) => {
    return Rx.fromPromise(PresentationApi.deleteJournal(id)).pipe(
      Rx.map(() => {
        return callNextActions(nextActions);
      })
    );
  })
  .on(actions.createLedger, ({ ledger, nextActions }) => {
    return Rx.fromPromise(PresentationApi.createLedger(ledger)).pipe(
      Rx.map(() => {
        return callNextActions(nextActions);
      })
    );
  })
  .on(actions.updateLedger, ({ id, ledger, nextActions }) => {
    return Rx.fromPromise(PresentationApi.updateLedger(id, ledger)).pipe(
      Rx.map(() => {
        return callNextActions(nextActions);
      })
    );
  })
  .on(actions.loadSummary, ({ summaryRequest }) => {
    return Rx.fromPromise(PresentationApi.selectSummary(summaryRequest)).pipe(
      Rx.map((res) => {
        return [actions.setSummary(res.data.body)];
      })
    );
  });

module
  .reducer(getInitialState())
  .on(actions.setInit, (state, { initData }) => {
    state.nendoList = initData.nendo_list;
    state.kamokuList = initData.kamoku_list;
    state.saimokuList = initData.saimoku_list;
  })
  .on(actions.setJournals, (state, { journalList }) => {
    state.journalList = journalList;
  })
  .on(actions.setLedger, (state, { ledgerList }) => {
    state.ledgerList = ledgerList;
  })
  .on(actions.setTmpLedgerCd, (state, { tmpLedgerCd }) => {
    state.tmpLedgerCd = tmpLedgerCd;
  })
  .on(actions.setSummary, (state, { summary }) => {
    state.summary = summary;
  });

export type Actions = typeof actions;

export const useActions = () => {
  return _useActions(actions);
};

export const useState = () => {
  return state.useState();
};

export const getState = () => {
  return state();
};

export const useModule = module;

export { actions, state };
