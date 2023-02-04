import React, { useEffect, useState } from 'react';
import './App.scss';
import clsx from 'clsx';
import {FaSortAmountDown} from 'react-icons/fa';
import {FaSortAmountUpAlt} from 'react-icons/fa';


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

  const CompareColumns = (a, b, column) => {
    if ((a[column] == 'BANNED') || (b[column] == 'BANNED')) return 1;

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
  }


  const [lastSortedColumn, setLastSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const SortByColumn = (column) => {
    //sort in ascending order (when column!=lastSortedColumn)
    //if same column is clicked twice, sort in descending order (when column==lastSortedColumn)
    //if subbreddit total subscribers is not a number, make it always the last row

    if (column != lastSortedColumn) {


      setSubreddits(subreddits.sort((a, b) => {

        return CompareColumns(a, b, column);

      }));

      setLastSortedColumn(column);
      setSortDirection('asc');
    }

    else {
      if (sortDirection == 'asc') {
        setSubreddits(subreddits.sort((a, b) => {

          return CompareColumns(b, a, column);

        }));

        setLastSortedColumn(column);
        setSortDirection('desc');
      }

      else {
        setSubreddits(subreddits.sort((a, b) => {

          return CompareColumns(a, b, column);

        }));

        setLastSortedColumn(column);
        setSortDirection('asc');
      }

    }
  }


  console.log({ sortDirection })
  console.log({ lastSortedColumn })







  return (
    <div className="App">
      <div className="flex flex-col">
        <div className=" sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full table">
                <thead className="bg-white border-b">
                  <tr>
                    {subreddits && Object.keys(subreddits[0])?.map((column, key) => {
                      return (
                        <th scope="col" className={clsx("text-sm font-medium text-gray-900 px-6 py-4 cursor-pointer no-highlight ", (key == 0) ? 'text-left' : 'text-center')} style={{ maxWidth: '200px' }}
                          onClick={() => SortByColumn(column)}

                        >
                         <div style={{display:'flex', alignItems:'center', marginRight: (column == lastSortedColumn) ? '': '8px'}}> <div style={{width:'max-content'}} >{column}</div> 
                         <div className='sort-icon' >{(column == lastSortedColumn) && (sortDirection == 'asc') && <FaSortAmountDown  /> 
                         || (column == lastSortedColumn) && (sortDirection == 'desc') && <FaSortAmountUpAlt />}
                         </div> </div>
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
                            <td className={clsx("text-sm text-gray-900  font-normal px-6 py-4 ", (key == 0) ? "text-left  " : "text-center")} >
                              {value}
                            </td>
                          )
                        })}
                      </tr>
                    )

                  }
                  )}
                  {subreddits && subreddits.map((subreddit) => {
                    if (isNaN(subreddit['Total Subscribers'])) return (
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
