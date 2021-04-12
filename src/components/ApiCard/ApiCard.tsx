import {Api} from '../../apiCalls';
import {Link} from 'react-router-dom'
/**
 * Representing a router link because the destructured Link prop was reassigning the value of Link
 */
const CardLink = Link
export const ApiCard = ({API, Auth, Cors, HTTPS, Category, Description, Link}: Api) => {
  return (
    <CardLink to={'/' + API}>
      <article>
        <h2>{API}</h2>
        <p>{Auth}</p>
        <p>{Cors}</p>
        <p>{HTTPS}</p>
        <p>{Category}</p>
        <p>{Description}</p>
        <p>{Link}</p>
      </article>
    </CardLink>
    )
}