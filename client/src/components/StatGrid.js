import { StyledGrid } from "../styles";

const StatGrid = ({stats}) => (
            <>
               {stats ? (
                   <StyledGrid>
                       {Array.from(stats).map(([key, value]) => (
                           <li className="grid_item" key={key}>
                               <div className="grid_item_inner">
                                    <p className="grid_item_stat_value">{value}</p>
                                    <h3 className='grid_item_stat_name'>{key}</h3>
                               </div>
                           </li>
                       ))

                       }
                   </StyledGrid>
               ): (
                <p className='empty_notice'>Pas de stats à afficher 😔</p>
               )}
            </>
)





export default StatGrid;