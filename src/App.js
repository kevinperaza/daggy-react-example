import React, { useState, useEffect } from "react";

import { isEmpty, complement } from "ramda";
import daggy from "daggy";
import "./styles.css";

const Item = daggy.tagged("Item", ["title"]);

const List = daggy.taggedSum("Page", {
  Empty: [],
  Initial: [],
  Items: [Item],
  NotFound: ["searchMessage"],
  FetchError: []
});

const LIST = [
  { title: "Butter" },
  { title: "Bread" },
  { title: "Eggs" },
  { title: "Fish" },
  { title: "Cake :3" }
];

const isNotEmpty = complement(isEmpty);

export default function App() {
  const [list, setList] = useState(List.Empty);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    Promise.resolve(LIST)
      .then(list =>
        isNotEmpty(list) ? setList(List.Items(list)) : setList(List.Empty)
      )
      .catch(() => setList(List.FetchError));
  }, []);

  const handleChange = ({ target }) => setSearchString(target.value);

  const matchSearch = item =>
    item.title.toLowerCase().indexOf(searchString) !== -1;

  const filterList = () =>
    list.cata({
      Empty: () => List.Empty,
      Initial: () => List.Initial,
      Items: items => {
        const filteredList = items.filter(matchSearch);

        return isNotEmpty(filteredList)
          ? List.Items(filteredList)
          : List.NotFound(searchString);
      },
      NotFound: () => List.NotFound(searchString),
      FetchError: () => List.FetchError
    });

  return (
    <div className="container">
      <input onChange={handleChange} />
      <ul>
        {filterList().cata({
          Empty: () => <li>This list is empty =(</li>,
          Initial: () => <li>Loading...</li>,
          Items: items => items.map(({ title }, i) => <li key={i}>{title}</li>),
          NotFound: searchMessage => (
            <li>There is nothing on your request: ’{searchMessage}’</li>
          ),
          FetchError: () => <li>Oooooops...</li>
        })}
      </ul>
    </div>
  );
}
