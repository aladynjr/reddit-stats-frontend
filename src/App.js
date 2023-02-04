import React, { useEffect, useState } from 'react';
import './App.scss';
import clsx from 'clsx';
function App() {

  const [subreddits, setSubreddits] = useState(null);
  const GetSubredditsData = async () => {
    try {
      const response = await fetch('http://143.198.58.92:3001/api/subs');
      const data = await response.json();
      console.log(data);

      setSubreddits(data);
    }
    catch (error) {
      console.log(error.message);
    }



  }
  useEffect(() => {
    GetSubredditsData();
  }, []);


  return (
    <div className="App">
      <div className="flex flex-col">
        <div className=" sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-white border-b">
                  <tr>
                    {subreddits && Object.keys(subreddits[0])?.map((column, key) => {
                      return (
                        <th scope="col" className={clsx("text-sm font-medium text-gray-900 px-6 py-4  ", (key==0) ? 'text-left' : 'text-center') }style={{minWidth:'170px'}} >
                          {column}
                        </th>
                      )})}
                  </tr>
                </thead>
                <tbody>
                  {subreddits && subreddits.map((subreddit) => {
                    return (
                      <tr className={clsx(" border-b transition duration-300 ease-in-out hover:bg-gray-100", isNaN(subreddit['Total Subscribers']) ? 'bg-red-100	': 'bg-white')}>
                        {Object.values(subreddit).map((value, key) => {
                          return (
                            <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 ", (key==0) ? "text-left" : "text-center")} >
                              {value}
                            </td>
                          )
                        })}
                      </tr>
                    )

                  }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
