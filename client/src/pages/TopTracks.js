import { useState, useEffect } from 'react';
import { getCurrentUserTopTracks, getCurrentUserProfile } from '../scripts/user';
import { TrackList, SectionWrapper, RangeButton } from '../components';
import { PlaylistGenButton } from '../components';
import { catchErrors } from '../utils';
import { StyledButton, StyledLogoutButton } from '../styles';

const TopTracks = () => {
    const [topTracks, setTopTracks] = useState(null);
    const [activeRange, setActiveRange] = useState('short');
    const [profile, setProfile] = useState(null);

        useEffect (() => {
            /**
         * On crée une fct asynchrone pour ne pas rendre le hook useEffect asynchrone (sinon c'est le dawa)
         * https://github.com/facebook/react/issues/14326
         */
        const fetchData = async () => {
            const tracks = await getCurrentUserTopTracks(`${activeRange}_term`);
            setTopTracks(tracks);

            const userProfile = await getCurrentUserProfile();
            setProfile(userProfile);
        };
        catchErrors(fetchData());
    },[activeRange]);

    return(
        <>
            <StyledButton href="/">Home</StyledButton>
            <StyledLogoutButton href='http://localhost:8000/logout'>Se déconnecter</StyledLogoutButton>
            <main>
                <SectionWrapper title='🚀 Top Sons' breadcrumb={true}>
                    <RangeButton activeRange={activeRange} setActiveRange={setActiveRange}/>
                    {topTracks && topTracks.items && (<TrackList tracks={topTracks.items}/>)}
                </SectionWrapper>
                {topTracks && topTracks.items && (
                <PlaylistGenButton items={topTracks.items} type={'tracks'} profile={profile} range={activeRange}/>)}
            </main>
        </>
    )
};

export default TopTracks;