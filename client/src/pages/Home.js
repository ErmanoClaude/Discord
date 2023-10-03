import { useState } from 'react';
import AllTabContent from '../components/AllTabContent';
import PendingTabContent from '../components/PendingTabContent';
import AddTabContent from '../components/AddTabContent';
import { Stack } from 'react-bootstrap';
import { BsFillPeopleFill } from 'react-icons/bs';

function Home() {

    const [activeTab, setActiveTab] = useState('all');

    return (
        <div>

            <Stack gap={5} direction='horizontal' className="tab-buttons mb-4">
                <div class='second-friends-title'>
                    <Stack direction="horizontal" gap={3}>
                        <BsFillPeopleFill /><h5 style={{ "color": "white" }}>Friends</h5>
                    </Stack>
                </div>
                <div className='vr' style={{'color':'white'}}></div>
                <h5
                    className={`${activeTab === 'all' ? 'active-tab' : ''} `}
                    onClick={() => setActiveTab('all')}
                >
                    All Friends
                </h5>

                <h5
                    className={`${activeTab === 'pending' ? 'active-tab' : ''} `}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                </h5>

                <h5
                    className={`${activeTab === 'add' ? 'active-tab' : ''} `}
                    onClick={() => setActiveTab('add')}
                >
                    Add Friend
                </h5>
            </Stack>

            <div className="tab-content">
                {activeTab === 'all' && <AllTabContent />}
                {activeTab === 'pending' && <PendingTabContent />}
                {activeTab === 'add' && <AddTabContent />}
            </div>
        </div>
    );

}

export default Home;