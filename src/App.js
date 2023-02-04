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

  const [lastSortedColumn, setLastSortedColumn] = useState(null);

  const SortByColumn = (column) => {
    //sort in ascending order (when column!=lastSortedColumn)
    //if same column is clicked twice, sort in descending order (when column==lastSortedColumn)
    //if subbreddit total subscribers is not a number, make it always the last row

    if (column != lastSortedColumn) {

      setSubreddits(subreddits.sort((a, b) => {
        if((a[column] =='BANNED')) return 1;
        if (isNaN(a[column])) {
          if (a[column].includes('@')) {
            return b[column].split('@')[0] - (a[column].split('@')[0]);
          } 
          
          else if (a[column].includes(':')) {
            return b[column].split(':')[0] - (a[column].split(':')[0]);
          }
          
          else {
            return b[column].localeCompare(a[column]);
          }
        }

        else {
          return b[column] - a[column];
        }
      }));
      setLastSortedColumn(column);
    }
    else {
      setSubreddits(subreddits.sort((a, b) => {
        if (isNaN(a[column])) {
          // return//b[column].localeCompare(a[column]);
          //check if it contains @ then split it and compare the first part
          if (a[column].includes('@')) {
            return (a[column].split('@')[0]) - (b[column].split('@')[0]);
          } 
          
          else if (a[column].includes(':')) {
            return (a[column].split(':')[0]) - (b[column].split(':')[0]);
          }

          else {
            return a[column].localeCompare(b[column]);
          }

        }
        else {
          return a[column] - b[column];
        }
      }));
      setLastSortedColumn(null);
    }





  }




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
                        <th scope="col" className={clsx("text-sm font-medium text-gray-900 px-6 py-4 cursor-pointer ", (key == 0) ? 'text-left' : 'text-center')} style={{ minWidth: '170px' }}
                          onClick={() => SortByColumn(column)}

                        >
                          {column}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {subreddits && subreddits.map((subreddit) => {
                    if (isNaN(subreddit['Total Subscribers'])) return null

                    return (
                      <tr className={clsx("bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100", isNaN(subreddit['Total Subscribers']) ? 'opacity-50	' : '')}>
                        {Object.values(subreddit).map((value, key) => {
                          return (
                            <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 ", (key == 0) ? "text-left" : "text-center")} >
                              {value}
                            </td>
                          )
                        })}
                      </tr>
                    )

                  }
                  )}
                  {subreddits && subreddits.map((subreddit) => {
                    if (isNaN(subreddit['Total Subscribers']))  return (
                      <tr className={clsx("bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100", isNaN(subreddit['Total Subscribers']) ? 'opacity-50	' : '')}>
                        {Object.values(subreddit).map((value, key) => {
                          return (
                            <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 ", (key == 0) ? "text-left" : "text-center")} >
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
