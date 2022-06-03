/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

const MaturityScoreContext = React.createContext();

export class MaturityScoreCtxProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  constructor(props) {
    super(props);
    this.state = {
      maturityScores: {}, // { '<productid>':{ <acct id> : {accountID:<acctId>, accountName:<acctName>,SCORE:<score> } }
      productTables: {} // { '<productid>':{ <index> : {accountID: <acctId>, accountName: <acctName>, ATTRIBUTE: <value>, SCORE: <score>} } }
    };
    this.updateScore = this.updateScore.bind(this);
  }

  /**
   *
   * @param {<['APM'|'BROWSER']>} productId
   * @param {{accountID:<acctId>, accountName:<acctName>,SCORE:<score> } } scores
   *
   */

  // ###
  updateScore(productId, scores, table) {
// ###
if (productId === 'APM' || productId === 'WORKLOADS') {
  console.log('### SK >>> MaturityScoreContext.updateScore-1:##### productId: ', productId);
  // ###
  // ###
  // // ### MaturityScoreContext.updateScore() #################
  // ###
  // ###
}
    this.setState(prev => {
      console.log('### SK >>> MaturityScoreContext.updateScore:##### productId: ', productId);
      // console.log('### SK >>> MaturityScoreContext.updateScore:##### scores: ', scores);
      console.log('### SK >>> MaturityScoreContext.updateScore:##### table: ', table);
// ###
      const maturityScores = prev.maturityScores;
// ###
      maturityScores[productId] = !maturityScores[productId]
        ? {}
        : maturityScores[productId];

// ###
      maturityScores[productId] = { ...scores };
// ###

      const productTables = prev.productTables;
// ###
      productTables[productId] = !productTables[productId]
        ? {}
        : productTables[productId];
// ###

      if (table && table.length > 0) {
        console.log('### SK >>> MaturityScoreContext - if (table && table.length > 0)');
        // create deep copy of table so we dont' affect the application popups for Browser and APM
// ###
        productTables[productId] = table
          .map(row => ({ ...row }))
          .map(row => {
            delete row.LIST;
            return row;
          });
// ###
      }
// ###
      // console.log('### SK >>> MaturityScoreContext.updateScore:##### maturityScores: ', maturityScores);
      console.log('### SK >>> MaturityScoreContext.updateScore:##### productTables: ', productTables);
      // console.log('### SK >>> MaturityScoreContext.updateScore:##### productTables: ', JSON.stringify(productTables));
// ###
      return { maturityScores: maturityScores, productTables: productTables };
// ###
    });
// ###
  }

  render() {
    console.log('### SK >>> MaturityScoreContext.redner--this.(props+state): ', this.props, this.state);
    return (
      <MaturityScoreContext.Provider
        value={{
          updateScore: this.updateScore,
          maturityScores: this.state.maturityScores,
          productTables: this.state.productTables
        }}
      >
        {this.props.children}
      </MaturityScoreContext.Provider>
    );
  }
}
export const MaturityScoreCtxConsumer = MaturityScoreContext.Consumer;
