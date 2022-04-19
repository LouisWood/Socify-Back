/**
 * Component qui se charge du rendu des artistes
 */
import {StyledGrid} from '../styles';

const ArtistGrid = ({artists}) => (
    <>
        {artists && artists.length ? (
            <StyledGrid type='artist'>
                {artists.map((artist, i) => (
                    <li className='grid_item' key={i}>
                        <div className='grid_item_inner'>
                            {artist.images[0] && (
                                    <div className='grid_item_img'>
                                        <img src={artist.images[0].url} alt={artist.name}/>
                                    </div>
                                )
                            }
                            <h3 className='grid_item_name overflow-ellipsis'>{artist.name}</h3>
                            <p className='grid_item_label'>Artiste</p>
                        </div>
                    </li>
                ))}
            </StyledGrid>
        ) : (
            <p className='empty-notice'>Pas d'artistes à afficher</p>
        )}
    </>
);

export default ArtistGrid;