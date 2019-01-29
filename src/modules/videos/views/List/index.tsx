import {Pagination} from "antd-mobile";
import {stringifyQuery, toUrl} from "common/routers";
import Icon, {IconClass} from "components/Icon";
import Search from "components/Search";
import {routerActions} from "connected-react-router";
import {ListItem, ListSearch, ListSummary} from "entity/video";
import {RootState} from "modules";
import appModule from "modules/app/facade";
import {ModuleNames} from "modules/names";
import {defaultListSearch} from "modules/videos/facade";
import * as React from "react";
import {connect, DispatchProp} from "react-redux";
import "./index.less";

interface Props extends DispatchProp {
  showSearch: boolean;
  listSearch: ListSearch | undefined;
  listItems: ListItem[] | undefined;
  listSummary: ListSummary | undefined;
}

let scrollTop = 0;

class Component extends React.PureComponent<Props> {
  private onPageChange = (page: number) => {
    const listSearch = {...this.props.listSearch, page};
    const search = stringifyQuery("search", listSearch, defaultListSearch);
    this.props.dispatch(routerActions.push(toUrl("/videos", search)));
  };
  private onSearch = (title: string) => {
    const listSearch = {...this.props.listSearch, title, page: 1};
    const search = stringifyQuery("search", listSearch, defaultListSearch);
    this.props.dispatch(routerActions.push(toUrl("/videos", search)));
  };
  private onSearchClose = () => {
    this.props.dispatch(appModule.actions.putShowSearch(false));
    if (this.props.listSearch!.title) {
      this.onSearch("");
    }
  };
  private onItemClick = (id: string) => {
    // 记住当前滚动位置
    scrollTop = window.pageYOffset;
    const url = `/videos/${id}`;
    this.props.dispatch(routerActions.push(url));
  };

  public render() {
    const {showSearch, listSearch, listItems, listSummary} = this.props;

    if (listItems && listSearch) {
      return (
        <div className={`${ModuleNames.videos}-List g-pic-list`}>
          <Search value={listSearch.title} onClose={this.onSearchClose} onSearch={this.onSearch} visible={showSearch} />
          <div className="list-items">
            {listItems.map(item => (
              <div onClick={() => this.onItemClick(item.id)} key={item.id} className="g-pre-img">
                <div style={{backgroundImage: `url(${item.coverUrl})`}}>
                  <h5 className="title">{item.title}</h5>
                  <div className="listImg" />
                  <div className="props">
                    <Icon type={IconClass.HEART} /> {item.hot}
                  </div>
                  <Icon className="icon-palyer" type={IconClass.PLAY_CIRCLE} />
                </div>
              </div>
            ))}
          </div>
          {listSummary && (
            <div className="g-pagination">
              <Pagination current={listSummary.page} total={listSummary.totalPages} onChange={this.onPageChange} />
            </div>
          )}
        </div>
      );
    } else {
      return null;
    }
  }
  public componentDidMount() {
    this.scroll();
  }
  public componentDidUpdate() {
    this.scroll();
  }
  private scroll() {
    // 恢复记住的滚动位置
    window.scrollTo(0, scrollTop);
    scrollTop = 0;
  }
}

const mapStateToProps = (state: RootState) => {
  const model = state.videos!;
  return {
    showSearch: Boolean(state.app!.showSearch),
    listSearch: model.listSearch,
    listItems: model.listItems,
    listSummary: model.listSummary,
  };
};

export default connect(mapStateToProps)(Component);
