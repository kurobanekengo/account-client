import * as React from "react";
import { useHistory } from "react-router";
import Numeral from "numeral";
import { useActions, useState } from "@module/action";

export interface HeaderParams {
  nendo: string | undefined;
  showJournal: boolean;
  journalsOrder: string | undefined;
  showLedger: boolean;
  ledgerCd: string | undefined;
  ledgerMonth: string | undefined;
}

export const Header = (props: HeaderParams) => {
  // load initial data
  const { loadInit, loadSummary, setSummary, setTmpLedgerCd, setLedger } =
    useActions();
  const state = useState();

  const [journalChecked, setJournalChecked] = React.useState(props.showJournal);
  const [ledgerChecked, setLedgerChecked] = React.useState(
    props.ledgerCd != null
  );
  const [ledgerCd, setLedgerCd] = React.useState(props.ledgerCd);
  const [journalsOrder, setJournalsOrder] = React.useState(
    undefined as string | undefined
  );
  const [ledgerMonth, setLedgerMonth] = React.useState(
    undefined as string | undefined
  );

  const journalRef = React.createRef<HTMLInputElement>();
  const ledgerRef = React.createRef<HTMLInputElement>();
  const ledgerCdSelectRef = React.createRef<HTMLSelectElement>();

  const createUrl = (props: {
    nendo: string | undefined;
    showJournal: boolean;
    showLedger: boolean;
    ledgerCd: string | undefined;
    journalsOrder: string | undefined;
    ledgerMonth: string | undefined;
    pageNo?: number | undefined;
  }): string => {
    const url = [];
    if (props.nendo === "") {
      return "/";
    }
    url.push(props.nendo);
    if (props.showJournal) {
      url.push("journal");
    }
    if (props.showLedger) {
      url.push("ledger");
    }
    if (props.ledgerCd != null) {
      url.push(props.ledgerCd);
    }
    const query = [];
    if (props.journalsOrder != null) {
      query.push(`journals_order=${props.journalsOrder}`);
    }
    if (props.ledgerMonth != null) {
      query.push(`month=${props.ledgerMonth}`);
    }
    if (props.pageNo != null) {
      query.push(`page_no=${props.pageNo}`);
    }
    const ret = `/${url.join("/")}${
      query.length === 0 ? "" : `?${query.join("&")}`
    }`;
    return ret;
  };

  React.useEffect(() => {
    loadInit();
  }, []);

  React.useEffect(() => {
    if (props.ledgerCd != null) {
      setTmpLedgerCd(props.ledgerCd);
    }
  }, [props.ledgerCd]);

  React.useEffect(() => {
    if (props.nendo != null) {
      loadSummary({ nendo: props.nendo });
    } else {
      setSummary({ sales: 0, expenses: 0, tax: undefined });
    }
  }, [props.nendo, state.journalList, state.ledgerList]);

  React.useEffect(() => {
    if (props.journalsOrder != null) {
      setJournalsOrder(props.journalsOrder);
    }
  }, [props.journalsOrder]);

  React.useEffect(() => {
    setLedgerMonth(props.ledgerMonth);
  }, [props.ledgerMonth]);

  const history = useHistory();
  return (
    <>
      <div className="mainHeaderRoot">
        <h1 className="subTitle">????????????</h1>
        <div className="mainHeader">
          <label>
            ??????:
            <select
              value={props.nendo}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                history.push(
                  createUrl({
                    nendo: e.target.value,
                    ledgerCd: props.ledgerCd,
                    showJournal: props.showJournal,
                    showLedger: props.showLedger,
                    journalsOrder: props.journalsOrder,
                    ledgerMonth: props.ledgerMonth,
                    pageNo: 1,
                  })
                );
              }}
            >
              <option></option>
              {state.nendoList.map((n) => {
                return <option key={n.nendo}>{n.nendo}</option>;
              })}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              name="displayType"
              id="journal"
              value="journal"
              checked={journalChecked}
              onClick={() => {
                if (journalRef.current?.checked) {
                  setJournalChecked(true);
                  setLedgerChecked(false);
                  history.push(
                    createUrl({
                      nendo: props.nendo,
                      ledgerCd: undefined,
                      showJournal: true,
                      showLedger: false,
                      journalsOrder: undefined,
                      ledgerMonth: undefined,
                    })
                  );
                } else {
                  setJournalChecked(false);
                  history.push(
                    createUrl({
                      nendo: props.nendo,
                      ledgerCd: undefined,
                      showJournal: false,
                      showLedger: false,
                      journalsOrder: undefined,
                      ledgerMonth: undefined,
                    })
                  );
                }
              }}
              ref={journalRef}
              disabled={props.nendo == null}
            />
            ?????????
          </label>
          <label>
            <input
              type="checkbox"
              name="displayType"
              id="ledger"
              value="ledger"
              checked={ledgerChecked}
              onClick={() => {
                if (ledgerRef.current?.checked) {
                  setLedgerChecked(true);
                  setJournalChecked(false);
                  if (state.tmpLedgerCd != null) {
                    history.push(
                      createUrl({
                        nendo: props.nendo,
                        ledgerCd: state.tmpLedgerCd,
                        showJournal: false,
                        showLedger: true,
                        journalsOrder: undefined,
                        ledgerMonth: undefined,
                      })
                    );
                  } else {
                    history.push(
                      createUrl({
                        nendo: props.nendo,
                        ledgerCd: undefined,
                        showJournal: false,
                        showLedger: true,
                        journalsOrder: undefined,
                        ledgerMonth: undefined,
                      })
                    );
                  }
                } else {
                  setLedgerChecked(false);
                  history.push(
                    createUrl({
                      nendo: props.nendo,
                      ledgerCd: undefined,
                      showJournal: false,
                      showLedger: false,
                      journalsOrder: undefined,
                      ledgerMonth: undefined,
                    })
                  );
                }
              }}
              ref={ledgerRef}
              disabled={props.nendo == null}
            />
            ?????????
          </label>
          <select
            value={state.tmpLedgerCd}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setLedger({ all_count: 0, list: [] });
              setLedgerCd(e.target.value);
              setTmpLedgerCd(e.target.value);
              history.push(
                createUrl({
                  nendo: props.nendo,
                  ledgerCd: e.target.value,
                  showJournal: false,
                  showLedger: true,
                  journalsOrder: undefined,
                  ledgerMonth: undefined,
                  pageNo: 1,
                })
              );
            }}
            disabled={!ledgerChecked}
            ref={ledgerCdSelectRef}
          >
            <option></option>
            {state.saimokuList.map((s) => {
              return (
                <option key={s.saimoku_cd} value={s.saimoku_cd}>
                  {s.saimoku_cd}: {s.saimoku_full_name}
                </option>
              );
            })}
          </select>
          {props.showLedger ? (
            <div className="ledgerSearchOption">
              <hr />
              {props.showLedger && props.ledgerCd == null ? (
                <span className="warning">??????????????????????????????????????????</span>
              ) : (
                <></>
              )}
              {props.showLedger && props.ledgerCd != null ? (
                <>
                  ?????????:
                  <select
                    value={ledgerMonth == null ? "" : ledgerMonth}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const value = e.target.value; //=== "" ? undefined : e.target.value;
                      setLedgerMonth(value);
                      history.push(
                        createUrl({
                          nendo: props.nendo,
                          ledgerCd: props.ledgerCd,
                          showJournal: false,
                          showLedger: true,
                          journalsOrder: undefined,
                          ledgerMonth: value,
                          pageNo: 1,
                        })
                      );
                    }}
                  >
                    {[
                      "all",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                      "01",
                      "02",
                      "03",
                    ].map((m) => {
                      //const value = m !== "" ? Numeral(m).format("00") : "";
                      return <option value={m}>{m === "all" ? "" : m}</option>;
                    })}
                  </select>
                </>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
          {props.showJournal ? (
            <div className="journalSearchOption">
              <hr />
              ?????????:
              <select
                value={journalsOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = e.target.value;
                  setJournalsOrder(value);
                  history.push(
                    createUrl({
                      nendo: props.nendo,
                      ledgerCd: undefined,
                      showJournal: true,
                      showLedger: false,
                      journalsOrder: value,
                      ledgerMonth: undefined,
                    })
                  );
                }}
              >
                <option value="0"></option>
                <option value="1">?????????/??????</option>
                <option value="2">??????/??????</option>
                <option value="3">??????/??????</option>
              </select>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="summaryHeader">
        <h1 className="subTitle">???????????????</h1>
        <div className="summaryHeader-base">
          <table>
            <tbody>
              <tr>
                <th>?????????</th>
                <td>{Numeral(state.summary.sales).format("0,0")}</td>
              </tr>
              <tr>
                <th>?????????</th>
                <td>{Numeral(state.summary.expenses).format("0,0")}</td>
              </tr>
              <tr>
                <th></th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="summaryHeader-tax">
          <table>
            <tbody>
              <tr>
                <th>?????????</th>
                <td>{format(state.summary.tax?.fixedCotax)}</td>
              </tr>
              <tr>
                <th>???????????????</th>
                <td>{format(state.summary.tax?.fixedLocalCotax)}</td>
              </tr>
              <tr>
                <th>???????????????</th>
                <td>{format(state.summary.tax?.fixedMunicipalTax)}</td>
              </tr>
              <tr>
                <th>???????????????</th>
                <td>{format(state.summary.tax?.fixedBizTax)}</td>
              </tr>
              <tr>
                <th>?????????????????????</th>
                <td>{format(state.summary.tax?.fixedSpecialLocalCotax)}</td>
              </tr>
              <tr>
                <th>???????????????</th>
                <td>
                  {(() => {
                    let sum = "";
                    if (state.summary.tax != null) {
                      const t = state.summary.tax;
                      const sumValue =
                        t.fixedCotax +
                        t.fixedLocalCotax +
                        t.fixedMunicipalTax +
                        t.fixedBizTax +
                        t.fixedSpecialLocalCotax;
                      sum = Numeral(sumValue).format("0,0");
                    }
                    return sum;
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const format = (n: number | undefined) => {
  if (format == null) {
    return "";
  }
  return Numeral(n).format("0,0");
};
